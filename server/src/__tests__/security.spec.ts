import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import * as fs from "fs";
import * as path from "path";
import jwt from "jsonwebtoken";

describe("Security hardening checks", () => {
  let app: INestApplication;
  let tmpRoot: string;
  let token: string;
  beforeAll(async () => {
    tmpRoot = fs.mkdtempSync(path.join(process.cwd(), "tmp-root-"));
    process.env.NAS_ROOT_DIR = tmpRoot;
    process.env.JWT_SECRET = "test-secret";
    fs.writeFileSync(path.join(tmpRoot, "hello.txt"), "hello");
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

  it("rejects path traversal for download", async () => {
    const res = await request(app.getHttpServer())
      .get("/files/download")
      .set("Authorization", `Bearer ${token}`)
      .query({ path: "../etc/passwd" })
      .expect(403);
    expect(res.body).toHaveProperty("message");
  });

  it("rejects invalid rename names", async () => {
    const res = await request(app.getHttpServer())
      .post("/files/rename")
      .set("Authorization", `Bearer ${token}`)
      .send({ oldPath: "hello.txt", newName: "../bad" })
      .expect(400);
    expect(res.body).toHaveProperty("message");
  });

  it("rejects invalid folder names", async () => {
    const res = await request(app.getHttpServer())
      .post("/files/folder")
      .set("Authorization", `Bearer ${token}`)
      .send({ path: "/", folderName: "../bad" })
      .expect(400);
    expect(res.body).toHaveProperty("message");
  });
});
