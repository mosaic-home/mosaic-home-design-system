import { Avatar, AvatarGroup } from '@mosaic-home/design-system/react';

export function AvatarExample() {
  return (
    <>
      <Avatar name="Ada Brook" size="large" status="online" />
      <AvatarGroup
        label="People at home"
        max={3}
        avatars={[
          { name: 'Ada Brook' },
          { name: 'Tomas Reed' },
          { name: 'Lena Ortiz' },
          { name: 'Sam Hale' },
        ]}
      />
    </>
  );
}
