import {
  boardConfigSymbol,
  boardSymbolFromKconfig,
  generateBoardCMakeLists,
  generateBoardKconfig,
  generateChipCMakeLists,
  generateChipKconfig,
  mergeChipCMakeLists,
  mergeChipKconfig,
  normalizeBoardKconfig,
} from "../src/pinmux/boardFiles";

let passed = 0;
let failed = 0;

function check(condition: boolean, message: string): void {
  if (condition) passed++;
  else {
    failed++;
    console.error("  FAIL:", message);
  }
}

console.log("\n=== Pinmux Board Files ===");

check(boardConfigSymbol("g32s10_fpga") === "BOARD_G32S10_FPGA", "board ids map to stable Kconfig symbols");
const boardCMake = generateBoardCMakeLists();
check(boardCMake.includes("${CMAKE_CURRENT_LIST_DIR}/board_pinmux.c"), "board CMake includes generated pinmux source");
check(boardCMake.includes("if(CONFIG_BSP_PINMUX)"), "board CMake uses the generic pinmux capability");
check(!boardCMake.includes("IMDE_BOARD_PINMUX_AVAILABLE=1"), "board CMake does not modify the SDK init path");

const boardKconfig = generateBoardKconfig("pd_lock");
check(boardSymbolFromKconfig(boardKconfig) === "BOARD_PD_LOCK", "board Kconfig exposes its symbol");
check(boardKconfig.includes("select BSP_PINMUX if DRIVER_GPIO"), "board Kconfig enables the generic pinmux capability");

const legacyKconfig = `choice
    prompt "G32S10 board"
    default BOARD_G32S10_FPGA

config BOARD_G32S10_FPGA
    bool "G32S10 FPGA board"

endchoice
`;
const normalized = normalizeBoardKconfig(legacyKconfig);
check(!normalized.includes("choice") && normalized.includes("config BOARD_G32S10_FPGA") && normalized.includes("select BSP_PINMUX if DRIVER_GPIO"), "legacy single-board Kconfig becomes a reusable pinmux fragment");

const boards = [{ id: "pd_lock" }, { id: "g32s10_fpga", symbol: "BOARD_G32S10_FPGA" }];
const chipCMake = generateChipCMakeLists(boards);
check(chipCMake.indexOf("g32s10_fpga") < chipCMake.indexOf("pd_lock") && chipCMake.includes("CONFIG_BOARD_PD_LOCK"), "chip CMake integrates every board deterministically");
const chipKconfig = generateChipKconfig("g32s10", boards, "g32s10_fpga");
check(chipKconfig.includes("default BOARD_G32S10_FPGA") && chipKconfig.includes("g32s10/pd_lock/Kconfig"), "chip Kconfig creates one board choice with all board fragments");

const mergedCMake = mergeChipCMakeLists(`set(CHIP_COMMON enabled)

if(CONFIG_BOARD_G32S10_FPGA)
    include("\${CMAKE_CURRENT_LIST_DIR}/g32s10_fpga/CMakeLists.txt")
endif()
`, boards);
check(mergedCMake.includes("set(CHIP_COMMON enabled)") && mergedCMake.includes("IMDE PINMUX BOARDS BEGIN") && mergedCMake.includes("pd_lock/CMakeLists.txt"), "chip CMake migration preserves unrelated chip setup");

const mergedKconfig = mergeChipKconfig(`menu "Chip options"
endmenu
source "code/bsp/g32s10/g32s10_fpga/Kconfig"
`, "g32s10", boards, "g32s10_fpga");
check(mergedKconfig.includes("menu \"Chip options\"") && mergedKconfig.includes("IMDE PINMUX BOARDS BEGIN") && mergedKconfig.includes("g32s10/pd_lock/Kconfig"), "chip Kconfig migration preserves unrelated chip options");

const emptyCMake = mergeChipCMakeLists(mergedCMake, []);
check(emptyCMake.trim() === "set(CHIP_COMMON enabled)" && !emptyCMake.includes("IMDE PINMUX BOARDS"), "removing the final board removes the managed CMake section");
const emptyKconfig = mergeChipKconfig(mergedKconfig, "g32s10", []);
check(emptyKconfig.includes("menu \"Chip options\"") && !emptyKconfig.includes("IMDE PINMUX BOARDS") && !emptyKconfig.includes("code/bsp/g32s10/"), "removing the final board removes the managed Kconfig choice");

console.log("\n" + (failed === 0 ? "OK" : "FAIL") + ` Passed: ${passed}  Failed: ${failed}`);
if (failed > 0) process.exit(1);
