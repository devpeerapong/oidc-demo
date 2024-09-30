import { join, dirname } from "path";
import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";

const grantable = new Set([
	"access_token",
	"authorization_code",
	"refresh_token",
	"device_code",
	"backchannel_authentication_request",
]);

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();

export class LowdbAdapter {
	constructor(name) {
		this.name = name;
	}

	async upsert(id, payload, expiresIn) {
		console.log(this.name, "upsert", { id, payload, expiresIn });
		const found = db.data?.[this.name]?.[id] ?? { payload: {} };

		let expiresAt;

		if (expiresIn) {
			expiresAt = Date.now() + expiresIn * 1000;
		}

		const data = {
			payload: { ...found.payload, ...payload },
			...(expiresAt ? { expiresAt } : undefined),
			createdAt: new Date(),
		};

		db.data[this.name][id] = data;
		await db.write();
	}

	async find(id) {
		console.info(this.name, "find", { id });
		return db.data[this.name][id]?.payload;
	}

	async findByUid(uid) {
		console.log(this.name, "findByUid", { uid });

		return Object.values(db.data[this.name]).find(({ payload }) => payload.uid === uid)?.payload;
	}

	async findByUserCode(userCode) {
		console.log(this.name, "findByUserCode", { userCode });
		const id = await client.get(userCodeKeyFor(userCode));
		return this.find(id);
	}

	async destroy(id) {
		console.info(this.name, "destroy", { id });
		delete db.data[this.name][id];
		await db.write();
	}

	async revokeByGrantId(grantId) {
		console.log(this.name, "revokeByGrantId", { grantId });
		db.data[this.name] = Object.fromEntries(
			Object.entries(db.data[this.name]).filter(([, item]) => item.payload.grantId !== grantId)
		);

		await db.write();
	}

	async consume(id) {
		console.log(this.name, "consume", { id });

		const data = db.data[this.name][id];

		if (!data) {
			return;
		}

		data.payload.consumed = Math.floor(Date.now() / 1000);

		await db.write();
	}

	key(id) {
		return `${this.name}:${id}`;
	}
}
