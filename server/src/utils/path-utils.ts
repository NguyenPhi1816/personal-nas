import * as path from "path";
import * as fs from "fs";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { getNasRootDir } from "../common/config/app-config";

export function resolveInsideRoot(relPath: string) {
  if (relPath === undefined || relPath === null)
    throw new BadRequestException("Invalid path");
  const root = getRoot();
  let safeRel = relPath && relPath !== "/" ? relPath : ".";
  // remove leading slashes/backslashes so inputs like '/foo/bar' are treated as relative
  if (safeRel !== ".") {
    safeRel = safeRel.replace(/^[\\/]+/, "");
    if (safeRel === "") safeRel = ".";
  }
  // disallow absolute paths that try to reach outside
  const abs = path.resolve(root, safeRel);
  if (!isInsideRoot(abs)) {
    throw new ForbiddenException("Path outside root");
  }
  return abs;
}

export function isInsideRoot(absPath: string) {
  const rootResolved = path.resolve(getRoot());
  const target = path.resolve(absPath);
  return target === rootResolved || target.startsWith(rootResolved + path.sep);
}

export function ensureDirExists(absPath: string) {
  if (!fs.existsSync(absPath)) {
    fs.mkdirSync(absPath, { recursive: true });
  }
}

export function getRoot() {
  return getNasRootDir();
}
