import bcrypt from "bcrypt";

async function generateHashes() {
    const passwords = ["password1", "password2"];

    for (let pwd of passwords) {
        const hash = await bcrypt.hash(pwd, 10);
        console.log(`password: ${pwd}, Hash: ${hash}`);
    }
}

generateHashes();