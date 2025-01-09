import path from "node:path";
import { readFileSync as atomicallyReadSync, writeFileSync as atomicallyWriteSync } from "atomically";
import fsExtra from "fs-extra";
import type { Data, Path } from "node_modules/atomically/dist/types";
import { injectable } from "tsyringe";

/**
 * This class handles file system operations, using `fs-extra` for most tasks except where the `atomically` package can
 * be used to improve reads and writes. The goal is to ensure that file operations are as safe as possible while still
 * providing a comfortable API.
 *
 * In this class, atomicity is focused on single files, as there's no trivial way to ensure atomicity for directories.
 *
 * This class' API matches that of the FileSystem class, but with sync methods. If you can, use the async version.
 */
@injectable()
export class FileSystemSync {
    /**
     * Copy a file or directory. The directory can have contents.
     *
     * This is file-atomic, but not directory-atomic. If the process crashes mid-operation, you may end up with some
     * files copied and some not, but never a partial file. The copy runs to completion before returning.
     *
     * @param src The source file or directory.
     * @param dest The destination file or directory.
     * @param extensionsWhitelist An optional array of file extensions to copy. If empty, all files are copied.
     * @returns void
     */
    public copy(src: string, dest: string, extensionsWhitelist: string[] = []): void {
        const stat = fsExtra.statSync(src);
        if (!stat.isDirectory()) {
            this.copyFile(src, dest, extensionsWhitelist);
            return;
        }

        const dirents = fsExtra.readdirSync(src, { withFileTypes: true, recursive: true });
        if (dirents.length === 0) {
            fsExtra.ensureDirSync(dest); // Ensures that an empty directory is created at the destination.
            return;
        }

        for (const dirent of dirents) {
            const srcItem = path.join(src, dirent.name);
            const destItem = path.join(dest, dirent.name);

            if (!dirent.isDirectory()) {
                this.copyFile(srcItem, destItem, extensionsWhitelist);
            } else {
                fsExtra.ensureDirSync(destItem); // Ensures that empty subdirectories are copied.
            }
        }
    }

    /**
     * Atomically copy a file. If the destination file exists, it will be overwritten.
     *
     * This is atomic. If the process crashes mid-write, you'll never end up with a partial file.
     *
     * @param src The source file path.
     * @param dest The destination file path.
     * @param extensionsWhitelist An optional array of file extensions to copy. If empty, all files are copied.
     * @returns void
     */
    private copyFile(src: string, dest: string, extensionsWhitelist: string[] = []): void {
        const ext = FileSystemSync.getFileExtension(src);
        if (extensionsWhitelist.length === 0 || extensionsWhitelist.map((e) => e.toLowerCase()).includes(ext)) {
            const data = this.read(src);
            this.write(dest, data);
        }
    }

    /**
     * Ensures that a directory is empty. Deletes directory contents if the directory is not empty. If the directory
     * does not exist, it is created. The directory itself is not deleted.
     *
     * This is not atomic. If the process crashes mid-operation, you may end up with a partially empty directory.
     *
     * @param dirPath The directory to empty.
     * @returns void
     */
    public emptyDir(dirPath: string): void {
        fsExtra.emptyDirSync(dirPath);
    }

    /**
     * Ensures that the directory exists. If the directory structure does not exist, it is created.
     *
     * @param dirPath The directory to ensure exists.
     * @returns void
     */
    public ensureDir(dirPath: string): void {
        fsExtra.ensureDirSync(dirPath);
    }

    /**
     * Ensures that the file exists. If the file that is requested to be created is in directories that do not exist,
     * these directories are created. If the file already exists, it is NOT MODIFIED.
     *
     * @param file The file path to ensure exists.
     * @returns void
     */
    public ensureFile(file: string): void {
        fsExtra.ensureFileSync(file);
    }

    /**
     * Moves a file or directory, even across devices. Overwrites by default.
     *
     * Note: When `src` is a file, `dest` must be a file and when `src` is a directory, `dest` must be a directory.
     *
     * This is atomic for same-device single file operations, but not as a whole opteration.
     *
     * @param src The source file path or directory.
     * @param dest The destination file path or directory.
     * @param overwriteDest Whether to overwrite the destination if it already exists.
     * @returns void
     */
    public move(src: string, dest: string, overwriteDest = true): void {
        fsExtra.moveSync(src, dest, { overwrite: overwriteDest, dereference: true });
    }

    /**
     * Change the name or location of a file or directory.
     *
     * This is atomic for same-device single file operations, but not as a whole opteration.
     *
     * @param currentPath The current file or directory path.
     * @param newPath The new file or directory path.
     * @returns void
     */
    public rename(currentPath: string, newPath: string): void {
        fsExtra.renameSync(currentPath, newPath);
    }

    /**
     * Reads a file and returns the contents as a string.
     *
     * @param file The file path to read.
     * @returns The file contents as a string.
     */
    public read(file: string): string {
        return atomicallyReadSync(file, { encoding: "utf8" });
    }

    /**
     * Writes data to a file, overwriting if the file already exists. If the parent directory does not exist, it's
     * created. File must be a file path (a buffer or a file descriptor is not allowed).
     *
     * This is atomic. If the process crashes mid-write, you'll never end up with a partial file.
     *
     * @param file The file path to write to.
     * @param data The data to write to the file.
     * @returns void
     */
    public write(file: string, data: Data): void {
        atomicallyWriteSync(file, data);
    }

    /**
     * Writes an object to a JSON file, overwriting if the file already exists. If the parent directory does not exist,
     * it's created. File must be a file path (a buffer or a file descriptor is not allowed).
     *
     * This is atomic. If the process crashes mid-write, you'll never end up with a partial file.
     *
     * @param file The file path to write to.
     * @param jsonObject The object to write to the file.
     * @param indentationSpaces The number of spaces to use for indentation.
     * @returns void
     */
    public writeJson(file: string, jsonObject: object, indentationSpaces?: 4): void {
        const jsonString = JSON.stringify(jsonObject, null, indentationSpaces);
        this.write(file, jsonString);
    }

    /**
     * Appends a string to the bottom of a file. If the file does not exist, it is created.
     *
     * This is atomic. If the process crashes mid-write, you'll never end up with a partial file.
     *
     * @param file The file path to append to.
     * @param data The string to append to the file.
     * @returns void
     */
    public append(file: string, data: string): void {
        this.ensureFile(file);
        const existingData = this.read(file);
        const newData = existingData + data;
        this.write(file, newData);
    }

    /**
     * Test whether the given path exists.
     *
     * @param fileOrDirPath The path to test.
     * @returns True if the path exists, false otherwise.
     */
    public exists(fileOrDirPath: string): boolean {
        return fsExtra.pathExistsSync(fileOrDirPath);
    }

    /**
     * Reads a JSON file and then parses it into an object.
     *
     * @param file The file path to read.
     * @returns The object parsed from the JSON file.
     */
    // biome-ignore lint/suspicious/noExplicitAny: JSON.parse returns any
    public readJson(file: Path): any {
        const data = this.read(file as string);
        return JSON.parse(data);
    }

    /**
     * Removes a file or directory. The directory can have contents. If the path does not exist, silently does nothing.
     *
     * This is file-atomic, but not directory-atomic. If the process crashes mid-operation, you may end up with some
     * files removed and some not, but not a partial file.
     *
     * @param dir The file path or directory to remove.
     * @returns void
     */
    public remove(dir: string): void {
        fsExtra.removeSync(dir);
    }

    /**
     * Get the extension of a file without the dot in lowercase.
     *
     * @param filepath The file path to get the extension of.
     * @returns The file extension without the dot in lowercase.
     */
    public static getFileExtension(filepath: string): string {
        return path.extname(filepath).replace(".", "").toLowerCase();
    }

    /**
     * Get the filename without its extension.
     *
     * @param filepath The file path to get the filename of.
     * @returns The filename without its extension.
     */
    public static stripExtension(filepath: string): string {
        return filepath.slice(0, -path.extname(filepath).length);
    }

    /**
     * Get the file name without its extension from a file path.
     *
     * @param filepath The file path to get the file name from.
     * @returns The file name without its extension.
     */
    public static getFileName(filepath: string): string {
        const baseName = path.basename(filepath);
        return FileSystemSync.stripExtension(baseName);
    }

    /**
     * Minify a JSON file by reading, parsing, and then stringifying it with no indentation.
     *
     * This is atomic. If the process crashes mid-write, you'll never end up with a partial file.
     *
     * @param filePath The file path to minify.
     * @returns void
     */
    public minifyJson(filePath: string): void {
        const originalData = this.read(filePath);
        const parsed = JSON.parse(originalData);
        const minified = JSON.stringify(parsed, null, 0);
        this.write(filePath, minified);
    }

    /**
     * Minify all JSON files in a directory by recursively finding all JSON files and minifying them.
     *
     * This is atomic for single files, but not as a whole opteration. You'll never end up with a partial file, but you
     * may end up with a partial directory if the process crashes mid-minify.
     *
     * @param dir The directory to minify JSON files in.
     * @returns void
     */
    public minifyJsonInDir(dir: string): void {
        const dirents = fsExtra.readdirSync(dir, { withFileTypes: true, recursive: true });
        for (const dirent of dirents) {
            if (dirent.isFile() && FileSystemSync.getFileExtension(dirent.name) === "json") {
                const fullPath = path.join(dir, dirent.name);
                this.minifyJson(fullPath);
            }
        }
    }

    /**
     * Get all files in a directory, optionally filtering by file type.
     *
     * Will always return paths with forward slashes.
     *
     * @param directory The directory to get files from.
     * @param searchRecursive Whether to search recursively.
     * @param fileTypes An optional array of file extensions to filter by (without the dot).
     * @param includeInputDir If true, the returned paths will include the directory parameter path. If false, the paths
     *                        will begin from within the directory parameter path. Default false.
     * @returns An array of file paths.
     */
    public getFiles(
        directory: string,
        searchRecursive = false,
        fileTypes?: string[],
        includeInputDir = false,
    ): string[] {
        if (!fsExtra.pathExistsSync(directory)) {
            return [];
        }
        const directoryNormalized = path.normalize(directory).replace(/\\/g, "/");
        const dirents = fsExtra.readdirSync(directory, { withFileTypes: true, recursive: searchRecursive });
        return (
            dirents
                // Filter out anything that isn't a file.
                .filter((dirent) => dirent.isFile())
                // Filter by file types, if specified.
                .filter((dirent) => {
                    const extension = FileSystemSync.getFileExtension(dirent.name);
                    return !fileTypes || fileTypes.includes(extension);
                })
                // Join and normalize the input directory and dirent.name to use forward slashes.
                .map((dirent) => path.join(dirent.parentPath, dirent.name).replace(/\\/g, "/"))
                // Optionally remove the input directory from the path.
                .map((dir) => (includeInputDir ? dir : dir.replace(directoryNormalized, "")))
        );
    }

    /**
     * Get all directories in a directory.
     *
     * Will always return paths with forward slashes.
     *
     * @param directory The directory to get directories from.
     * @param searchRecursive Whether to search recursively. Default false.
     * @param includeInputDir If true, the returned paths will include the directory parameter path. If false, the paths
     *                        will begin from within the directory parameter path. Default false.
     * @returns An array of directory paths.
     */
    public getDirectories(directory: string, searchRecursive = false, includeInputDir = false): string[] {
        if (!fsExtra.pathExistsSync(directory)) {
            return [];
        }
        const directoryNormalized = path.normalize(directory).replace(/\\/g, "/");
        const dirents = fsExtra.readdirSync(directoryNormalized, { withFileTypes: true, recursive: searchRecursive });
        return (
            dirents
                // Filter out anything that isn't a directory.
                .filter((dirent) => dirent.isDirectory())
                // Join and normalize the input directory and dirent.name to use forward slashes.
                .map((dirent) => path.join(dirent.parentPath, dirent.name).replace(/\\/g, "/"))
                // Optionally remove the input directory from the path.
                .map((dir) => (includeInputDir ? dir : dir.replace(directoryNormalized, "")))
        );
    }
}
