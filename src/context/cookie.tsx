"use server";

import { handleDecryption } from "@/utils/Decrypt";
import { handleEncryption } from "@/utils/Encrypt";
import { cookies } from "next/headers";

export const getCookie = async (cookieName: string) => {
  try {
    const cookieStore = await cookies();

    const data = cookieStore.get(cookieName)!.value;
    const splittedData = data!.split("*=+dipa");
    const encryptedData = splittedData![0];
    const initVector = splittedData![1];
    const decryptedData = await handleDecryption({ encryptedData, initVector });
    return decryptedData;
  } catch (error) {
    return null;
  }
};

export async function setCookie(key: string, value: string) {
  const cookieStore = await cookies();

  const encrypedValue = await handleEncryption(value);

  cookieStore.set(
    key,
    `${encrypedValue.encryptedData}*=+dipa${encrypedValue.initVector}`,
    {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "strict", // Mencegah cookie terkirim ke domain lain
    },
  );
}

export async function deleteCookie(key: string) {
  const cookieStore = await cookies();
  cookieStore.delete(key);
}
