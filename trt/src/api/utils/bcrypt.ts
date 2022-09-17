import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

export function compareSecret(rawPassword: string, hash: string){
  return bcrypt.compareSync(rawPassword, hash);
}
