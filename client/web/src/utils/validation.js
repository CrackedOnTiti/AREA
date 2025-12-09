 // Valide une adresse email 
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Valide qu'un champ n'est pas vide

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Valide un nom d'utilisateur (3-20 caractères alphanumériques)

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};
