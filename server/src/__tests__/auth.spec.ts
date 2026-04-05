import request from "supertest";
import * as fs from "fs";
import * as path from "path";
import jwt from "jsonwebtoken";

describe("Auth hooks", () => {
  let appServer: any;
  let appRef: any;
  let tmpRoot: string;
  beforeAll(async () => {
    tmpRoot = fs.mkdtempSync(path.join(process.cwd(), "tmp-root-"));
    process.env.NAS_ROOT_DIR = tmpRoot;
    process.env.JWT_SECRET = "test-secret";
    fs.writeFileSync(path.join(tmpRoot, "hello.txt"), "hello");
    const { AppModule } = require("../app.module");
    const { Test } = require("@nestjs/testing");
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    appServer = app.getHttpServer();
    appRef = app;
  });
  afterAll(async () => {
    if (appRef) await appRef.close();
  });

  it("returns null user when no token", async () => {
    const res = await request(appServer).get("/auth/check").expect(200);
    expect(res.body.user).toBeNull();
  });

  it("accepts valid JWT and returns user payload", async () => {
    const token = jwt.sign({ sub: "user1" }, "test-secret");
    const res = await request(appServer)
      .get("/auth/check")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(res.body.user).toHaveProperty("sub", "user1");
  });

  it("delete endpoint requires auth", async () => {
    // without token
    await request(appServer)
      .delete("/files")
      .send({ path: "hello.txt" })
      .expect(401);
    // with token
    fs.writeFileSync(path.join(tmpRoot, "hello.txt"), "hello");
    const token = jwt.sign({ sub: "user1" }, "test-secret");
    const res = await request(appServer)
      .delete("/files")
      .set("Authorization", `Bearer ${token}`)
      .send({ path: "hello.txt" })
      .expect(200);
    expect(res.body.success).toBe(true);
  });
});
