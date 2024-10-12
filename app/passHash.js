import { createHash } from "crypto"

function passHash(pass) {
    return createHash("sha512").update(pass.trim()).digest("hex");
}

export default passHash;