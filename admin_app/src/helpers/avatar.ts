import { buildS3Url } from "@definitions/configs/s3";
import { Account } from "@definitions/types";

export const buildAvatar = (account: Account) => {
  const url = new URL(
    "https://ui-avatars.com/api/&background=2563EB&color=fff"
  );
  url.searchParams.set("name", `${account.givenName} ${account.surname}`);
  if (!account.profilePicture) {
    return url.toString();
  }
  if (account.profilePicture.length > 0) {
    return buildS3Url(account.profilePicture);
  }
  return url.toString();
};
