import {
  validatePresence,
  validateFormat,
  validateConfirmation,
  validateLength
} from 'ember-changeset-validations/validators';

export default {
  email: validateFormat({ type: 'email'}),
  username: validatePresence(true),
  password: validateLength({ min: 6 }),
  passwordConfirmation: validateConfirmation({ on: 'password' })
};
