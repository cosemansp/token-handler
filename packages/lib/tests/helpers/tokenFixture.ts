import jwt from 'jsonwebtoken';

export const accessToken = jwt.sign(
  {
    oid: '1234567890',
    name: 'John Doe',
    email: 'john.doe@example.com',
    roles_euri: 'staff,tsz:admin',
  },
  'abc',
);

export const idToken = jwt.sign(
  {
    oid: '1234567890',
    name: 'John Doe',
    email: 'john.doe@example.com',
    roles_euri: 'staff,tsz:admin',
  },
  'abc',
);
