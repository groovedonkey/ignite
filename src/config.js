export const REALTOR = {
  name: 'Pedro Gonzalez',
  email: 'dro@groovedonkey.com',
  phone: '(912) 555-0180',
  company: 'Groove Donkey Realtyworks',
  location: 'Brunswick, GA',
  tagline: 'Your Golden Isles real estate expert',
  // The only account allowed into /portal — must match the email checked in
  // firestore.rules' isRealtor(), or reads/writes will be denied even after
  // a successful Google sign-in.
  allowedEmail: 'littlepete1976@gmail.com',
}
