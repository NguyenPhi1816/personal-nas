import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

describe("Auth login flow", () => {
  let app: INestApplication;
  let tmpRoot: string;
  beforeAll(async () => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "personal-nas-root-"));
    process.env.NAS_ROOT_DIR = tmpRoot;
    process.env.JWT_SECRET = "test-secret";
    const { AppModule } = require("../app.module");
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    if (app) await app.close();
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("POST /api/auth/login with valid credentials returns token", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "admin", password: "admin123" })
      .expect(201);

    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.username).toBe("admin");
  });

  it("POST /api/auth/login with invalid credentials fails", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "admin", password: "wrongpass" })
      .expect(401); // UnauthorizedException returns 401

    expect(res.body).toHaveProperty("message");
  });

  it("can use token to access protected endpoint", async () => {
    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "admin", password: "admin123" })
      .expect(201);

    const token = loginRes.body.token;

    // Use token to access protected endpoint
    const res = await request(app.getHttpServer())
      .get("/auth/check")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.user).toHaveProperty("username", "admin");
  });
});
