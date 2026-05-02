import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import jwt from "jsonwebtoken";

describe("Files API (e2e)", () => {
  let app: INestApplication;
  let tmpRoot: string;
  let token: string;
  beforeAll(async () => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "personal-nas-root-"));
    process.env.NAS_ROOT_DIR = tmpRoot;
    process.env.JWT_SECRET = "test-secret";
    const testerRoot = path.join(tmpRoot, "tester");
    fs.mkdirSync(testerRoot, { recursive: true });
    // create files before app init so services can see them
    fs.writeFileSync(path.join(testerRoot, "hello.txt"), "hello");
    fs.writeFileSync(path.join(testerRoot, "client_upload.txt"), "upload-me");
    fs.writeFileSync(
      path.join(testerRoot, "sample.png"),
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO3N3NkAAAAASUVORK5CYII=",
        "base64",
      ),
    );
    const { AppModule } = require("../app.module");
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    token = jwt.sign({ sub: "tester" }, "test-secret");
  });
  afterAll(async () => {
    if (app) await app.close();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("/api/files (GET) returns list", async () => {
    const res = await request(app.getHttpServer())
      .get("/files")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((e: any) => e.name === "hello.txt")).toBe(true);
  });

  it("/api/images/thumbnail (GET) renders a thumbnail for a user file", async () => {
    const res = await request(app.getHttpServer())
      .get("/images/thumbnail")
      .set("Authorization", `Bearer ${token}`)
      .query({ path: "sample.png", width: 64 })
      .expect(200);

    expect(res.headers["content-type"]).toContain("image/png");
  });

  it("/api/files/download (GET) downloads file", async () => {
    const res = await request(app.getHttpServer())
      .get("/files/download")
      .set("Authorization", `Bearer ${token}`)
      .query({ path: "hello.txt" })
      .expect(200);
    const buf = Buffer.isBuffer(res.body)
      ? res.body
      : Buffer.from(res.text || "");
    expect(buf.toString()).toBe("hello");
  });

  it("uploads a file via multipart and deletes it", async () => {
    // attach a file from disk (client_upload.txt exists in tmpRoot)
    const uploadRes = await request(app.getHttpServer())
      .post("/files/upload")
      .set("Authorization", `Bearer ${token}`)
      .field("path", "/")
      .attach("file", path.join(tmpRoot, "tester", "client_upload.txt"))
      .expect(201);
    expect(uploadRes.body.path).toBeDefined();

    // ensure file appears in listing
    const listAfter = await request(app.getHttpServer())
      .get("/files")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(
      listAfter.body.some((e: any) => e.name === "client_upload.txt"),
    ).toBe(true);

    // delete the uploaded file
    const del = await request(app.getHttpServer())
      .delete("/files")
      .set("Authorization", `Bearer ${token}`)
      .send({ path: "client_upload.txt" })
      .expect(200);
    expect(del.body.success).toBe(true);

    const listFinal = await request(app.getHttpServer())
      .get("/files")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(
      listFinal.body.some((e: any) => e.name === "client_upload.txt"),
    ).toBe(false);
  });

  it("creates a folder and renames a file", async () => {
    const folderRes = await request(app.getHttpServer())
      .post("/files/folder")
      .set("Authorization", `Bearer ${token}`)
      .send({ path: "/", folderName: "newfolder" })
      .expect(201);
    expect(folderRes.body.path).toBeDefined();

    const list1 = await request(app.getHttpServer())
      .get("/files")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(
      list1.body.some(
        (e: any) => e.name === "newfolder" && e.type === "directory",
      ),
    ).toBe(true);

    const renameRes = await request(app.getHttpServer())
      .post("/files/rename")
      .set("Authorization", `Bearer ${token}`)
      .send({ oldPath: "hello.txt", newName: "hello-renamed.txt" })
      .expect(201);
    expect(renameRes.body.newPath).toBeDefined();

    const list2 = await request(app.getHttpServer())
      .get("/files")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(list2.body.some((e: any) => e.name === "hello-renamed.txt")).toBe(
      true,
    );
  });
});
