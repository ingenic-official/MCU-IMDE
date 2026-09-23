import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { createPinmuxBoard, deletePinmuxBoard, validateBoardId, writePinmuxFile, writePinmuxFiles } from "../src/pinmux/boardWorkspace";

let passed = 0;
let failed = 0;

function check(condition: boolean, message: string): void {
  if (condition) passed++;
  else {
    failed++;
    console.error("  FAIL:", message);
  }
}

async function main(): Promise<void> {
  console.log("\n=== Pinmux Board Workspace ===");
  check(Boolean(validateBoardId("../bad")), "board ids cannot escape the chip directory");
  check(validateBoardId("pd_lock") === undefined, "valid board ids are accepted");
  check(validateBoardId("2nd_board") === undefined, "board ids may start with a digit");

  const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "imde-pinmux-board-"));
  try {
    const firstAtomicFile = path.join(root, "atomic-first.c");
    const secondAtomicFile = path.join(root, "atomic-second.h");
    await fs.promises.writeFile(firstAtomicFile, "first before\n", "utf8");
    await fs.promises.writeFile(secondAtomicFile, "second before\n", "utf8");
    await fs.promises.writeFile(`${firstAtomicFile}.imde.bak`, "first older backup\n", "utf8");
    await fs.promises.writeFile(`${secondAtomicFile}.imde.bak`, "second older backup\n", "utf8");
    const originalWriteFile = fs.promises.writeFile;
    let transactionRejected = false;
    try {
      (fs.promises as any).writeFile = async (...args: any[]) => {
        if (path.resolve(String(args[0])) === path.resolve(secondAtomicFile) && args[1] === "second after\n") {
          throw new Error("injected second-file failure");
        }
        return (originalWriteFile as any)(...args);
      };
      await writePinmuxFiles([
        { filePath: firstAtomicFile, source: "first after\n" },
        { filePath: secondAtomicFile, source: "second after\n" },
      ]);
    } catch {
      transactionRejected = true;
    } finally {
      (fs.promises as any).writeFile = originalWriteFile;
    }
    check(transactionRejected, "batch write reports a later file failure");
    check(
      await fs.promises.readFile(firstAtomicFile, "utf8") === "first before\n"
        && await fs.promises.readFile(secondAtomicFile, "utf8") === "second before\n",
      "batch write rolls back every target after a partial failure",
    );
    check(
      await fs.promises.readFile(`${firstAtomicFile}.imde.bak`, "utf8") === "first older backup\n"
        && await fs.promises.readFile(`${secondAtomicFile}.imde.bak`, "utf8") === "second older backup\n",
      "batch write leaves unrelated legacy backup files untouched",
    );

    const chipDirectory = path.join(root, "g32s10");
    const sourceDirectory = path.join(chipDirectory, "g32s10_fpga");
    await fs.promises.mkdir(path.join(sourceDirectory, "include"), { recursive: true });
    await fs.promises.writeFile(path.join(sourceDirectory, "board_pinmux.c"), "old pinmux\n", "utf8");
    await fs.promises.writeFile(path.join(sourceDirectory, "board_pinmux.c.imde.bak"), "old backup\n", "utf8");
    await fs.promises.writeFile(path.join(sourceDirectory, "include", "board_pins.h"), "template pins\n", "utf8");
    await fs.promises.writeFile(path.join(sourceDirectory, "CMakeLists.txt"), "old board cmake\n", "utf8");
    await fs.promises.writeFile(path.join(sourceDirectory, "Kconfig"), `choice
    prompt "G32S10 board"
    default BOARD_G32S10_FPGA
config BOARD_G32S10_FPGA
    bool "FPGA"
endchoice
`, "utf8");
    await fs.promises.writeFile(path.join(chipDirectory, "CMakeLists.txt"), `set(CHIP_COMMON enabled)
if(CONFIG_BOARD_G32S10_FPGA)
    include("\${CMAKE_CURRENT_LIST_DIR}/g32s10_fpga/CMakeLists.txt")
endif()
`, "utf8");
    await fs.promises.writeFile(path.join(chipDirectory, "Kconfig"), `source "code/bsp/g32s10/g32s10_fpga/Kconfig"\n`, "utf8");
    const stableBoardKconfigPath = path.join(chipDirectory, "stable_board", "Kconfig");
    await fs.promises.mkdir(path.dirname(stableBoardKconfigPath), { recursive: true });
    await fs.promises.writeFile(stableBoardKconfigPath, "config BOARD_STABLE_BOARD\r\n    bool \"Stable board\"\r\n    select BSP_PINMUX if DRIVER_GPIO\r\n", "utf8");

    const writeResult = await writePinmuxFile(path.join(sourceDirectory, "board_pinmux.c"), "new pinmux\n");
    check(writeResult.changed, "applying pinmux reports a changed BSP file");
    check(await fs.promises.readFile(path.join(sourceDirectory, "board_pinmux.c.imde.bak"), "utf8") === "old backup\n", "applying pinmux does not overwrite a legacy backup file");

    const created = await createPinmuxBoard({
      boardId: "pd_lock",
      chipId: "g32s10",
      pinmuxSource: "generated pd_lock pinmux\n",
      boardPinsSource: "generated pd_lock pins\n",
      sourceBoardDirectory: sourceDirectory,
      sourceBoardId: "g32s10_fpga",
    });
    check(await fs.promises.readFile(created.pinmuxFile, "utf8") === "generated pd_lock pinmux\n", "new board receives the generated pinmux source");
    check(await fs.promises.readFile(path.join(created.boardDirectory, "include", "board_pins.h"), "utf8") === "generated pd_lock pins\n", "new board replaces copied board pins with generated selections");
    check(!await fs.promises.access(path.join(created.boardDirectory, "include", "board_pinmux.h")).then(() => true).catch(() => false), "new board uses the common BSP pinmux header");
    check(!await fs.promises.access(path.join(created.boardDirectory, "board_pinmux.c.imde.bak")).then(() => true).catch(() => false), "new board does not copy generated backup files");
    check(!(await fs.promises.readFile(path.join(created.boardDirectory, "CMakeLists.txt"), "utf8")).includes("IMDE_BOARD_PINMUX_AVAILABLE=1"), "new board CMake does not modify the SDK init path");
    const newBoardKconfig = await fs.promises.readFile(path.join(created.boardDirectory, "Kconfig"), "utf8");
    check(newBoardKconfig.includes("config BOARD_PD_LOCK") && newBoardKconfig.includes("select BSP_PINMUX if DRIVER_GPIO"), "new board gets its symbol and pinmux capability");
    check((await fs.promises.readFile(path.join(chipDirectory, "CMakeLists.txt"), "utf8")).includes("pd_lock/CMakeLists.txt"), "chip CMake discovers the new board");
    check((await fs.promises.readFile(path.join(chipDirectory, "Kconfig"), "utf8")).includes("g32s10/pd_lock/Kconfig"), "chip Kconfig discovers the new board");
    check(!(await fs.promises.readFile(path.join(sourceDirectory, "Kconfig"), "utf8")).includes("choice"), "legacy source board Kconfig is migrated to a choice fragment");
    check(!created.updatedFiles.includes(stableBoardKconfigPath), "unchanged CRLF board Kconfig is not rewritten");

    const blankCreated = await createPinmuxBoard({
      boardId: "blank_board",
      chipId: "g32s10",
      chipDirectory,
      pinmuxSource: "generated blank pinmux\n",
      boardPinsSource: "generated blank pins\n",
    });
    check(await fs.promises.readFile(blankCreated.pinmuxFile, "utf8") === "generated blank pinmux\n", "blank board receives the generated pinmux source");
    check(await fs.promises.readFile(path.join(blankCreated.boardDirectory, "include", "board_pins.h"), "utf8") === "generated blank pins\n", "blank board receives the generated board pins header");
    check(!await fs.promises.access(path.join(blankCreated.boardDirectory, "old pinmux.c")).then(() => true).catch(() => false), "blank board does not copy files from an existing board");
    const blankChipKconfig = await fs.promises.readFile(path.join(chipDirectory, "Kconfig"), "utf8");
    check(blankChipKconfig.includes("g32s10/blank_board/Kconfig") && blankChipKconfig.includes("default BOARD_G32S10_FPGA"), "blank board is integrated without changing the existing default board");
    check((await fs.promises.readFile(path.join(chipDirectory, "CMakeLists.txt"), "utf8")).includes("blank_board/CMakeLists.txt"), "chip CMake discovers the blank board");

    const chipCMakeBeforeDeleteFailure = await fs.promises.readFile(path.join(chipDirectory, "CMakeLists.txt"), "utf8");
    const chipKconfigBeforeDeleteFailure = await fs.promises.readFile(path.join(chipDirectory, "Kconfig"), "utf8");
    const originalDeleteWriteFile = fs.promises.writeFile;
    let deleteRejected = false;
    try {
      (fs.promises as any).writeFile = async (...args: any[]) => {
        if (path.resolve(String(args[0])) === path.resolve(path.join(chipDirectory, "Kconfig")) && !String(args[1]).includes("blank_board")) {
          throw new Error("injected board deletion failure");
        }
        return (originalDeleteWriteFile as any)(...args);
      };
      await deletePinmuxBoard({ boardId: "blank_board", chipId: "g32s10", chipDirectory });
    } catch {
      deleteRejected = true;
    } finally {
      (fs.promises as any).writeFile = originalDeleteWriteFile;
    }
    check(deleteRejected, "board deletion reports an integration write failure");
    check(await fs.promises.access(blankCreated.boardDirectory).then(() => true).catch(() => false), "failed board deletion restores the BSP directory");
    check(
      await fs.promises.readFile(path.join(chipDirectory, "CMakeLists.txt"), "utf8") === chipCMakeBeforeDeleteFailure
        && await fs.promises.readFile(path.join(chipDirectory, "Kconfig"), "utf8") === chipKconfigBeforeDeleteFailure,
      "failed board deletion restores chip integration files",
    );

    const deletedBlank = await deletePinmuxBoard({ boardId: "blank_board", chipId: "g32s10", chipDirectory });
    check(!await fs.promises.access(deletedBlank.boardDirectory).then(() => true).catch(() => false), "successful board deletion removes the BSP directory");
    check(!(await fs.promises.readFile(path.join(chipDirectory, "CMakeLists.txt"), "utf8")).includes("blank_board/CMakeLists.txt"), "successful board deletion removes the chip CMake registration");
    check(!(await fs.promises.readFile(path.join(chipDirectory, "Kconfig"), "utf8")).includes("g32s10/blank_board/Kconfig"), "successful board deletion removes the chip Kconfig registration");

    const newChipDirectory = path.join(root, "g32s20");
    await fs.promises.mkdir(newChipDirectory, { recursive: true });
    await fs.promises.writeFile(path.join(newChipDirectory, "CMakeLists.txt"), "set(CHIP_COMMON enabled)\n", "utf8");
    await fs.promises.writeFile(path.join(newChipDirectory, "Kconfig"), "# no boards yet\n", "utf8");
    const firstBoard = await createPinmuxBoard({
      boardId: "first_board",
      chipId: "g32s20",
      chipDirectory: newChipDirectory,
      pinmuxSource: "generated first pinmux\n",
      boardPinsSource: "generated first pins\n",
    });
    check(await fs.promises.readFile(firstBoard.pinmuxFile, "utf8") === "generated first pinmux\n", "first board can be created for a chip without existing boards");
    check((await fs.promises.readFile(path.join(newChipDirectory, "Kconfig"), "utf8")).includes("default BOARD_FIRST_BOARD"), "first board becomes the default for a new chip");
    await deletePinmuxBoard({ boardId: "first_board", chipId: "g32s20", chipDirectory: newChipDirectory });
    check(!(await fs.promises.readFile(path.join(newChipDirectory, "Kconfig"), "utf8")).includes("IMDE PINMUX BOARDS"), "deleting the final board removes the chip Kconfig managed section");
    check(!(await fs.promises.readFile(path.join(newChipDirectory, "CMakeLists.txt"), "utf8")).includes("IMDE PINMUX BOARDS"), "deleting the final board removes the chip CMake managed section");

    const chipCMakeBeforeFailure = await fs.promises.readFile(path.join(chipDirectory, "CMakeLists.txt"), "utf8");
    const chipKconfigBeforeFailure = await fs.promises.readFile(path.join(chipDirectory, "Kconfig"), "utf8");
    const originalCreateWriteFile = fs.promises.writeFile;
    let createRejected = false;
    try {
      (fs.promises as any).writeFile = async (...args: any[]) => {
        if (path.resolve(String(args[0])) === path.resolve(path.join(chipDirectory, "Kconfig")) && String(args[1]).includes("broken_board")) {
          throw new Error("injected board integration failure");
        }
        return (originalCreateWriteFile as any)(...args);
      };
      await createPinmuxBoard({
        boardId: "broken_board",
        chipId: "g32s10",
        pinmuxSource: "generated broken pinmux\n",
        boardPinsSource: "generated broken pins\n",
        sourceBoardDirectory: sourceDirectory,
        sourceBoardId: "g32s10_fpga",
      });
    } catch {
      createRejected = true;
    } finally {
      (fs.promises as any).writeFile = originalCreateWriteFile;
    }
    check(createRejected, "board creation reports an integration write failure");
    check(!await fs.promises.access(path.join(chipDirectory, "broken_board")).then(() => true).catch(() => false), "failed board creation removes the incomplete board directory");
    check(
      await fs.promises.readFile(path.join(chipDirectory, "CMakeLists.txt"), "utf8") === chipCMakeBeforeFailure
        && await fs.promises.readFile(path.join(chipDirectory, "Kconfig"), "utf8") === chipKconfigBeforeFailure,
      "failed board creation rolls back chip integration files",
    );

    await deletePinmuxBoard({ boardId: "g32s10_fpga", chipId: "g32s10", chipDirectory });
    check((await fs.promises.readFile(path.join(chipDirectory, "Kconfig"), "utf8")).includes("default BOARD_PD_LOCK"), "deleting the default board selects the first remaining board deterministically");
  } finally {
    await fs.promises.rm(root, { force: true, recursive: true });
  }

  console.log("\n" + (failed === 0 ? "OK" : "FAIL") + ` Passed: ${passed}  Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

void main();
