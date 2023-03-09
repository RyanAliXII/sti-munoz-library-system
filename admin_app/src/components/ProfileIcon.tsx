type ProfileIconProps = {
  givenName: string;
  surname: string;
};
const ProfileIcon = ({ givenName, surname }: ProfileIconProps) => {
  return (
    <img
      className="rounded-full w-10 h-10"
      src={`https://ui-avatars.com/api/?name=${givenName}${surname}&background=2563EB&color=fff`}
      alt="profile-image"
    ></img>
  );
};

export default ProfileIcon;
