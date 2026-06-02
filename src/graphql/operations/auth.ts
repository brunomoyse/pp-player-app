import { gql, type TypedDocumentNode } from '@apollo/client';

import type { User, UserLoginInput, UserRegistrationInput } from '@/types/user';

export interface LoginResult {
  loginUser: { token: string; user: User };
}
export interface LoginVars {
  input: UserLoginInput;
}

export const LOGIN_USER: TypedDocumentNode<LoginResult, LoginVars> = gql`
  mutation LoginUser($input: UserLoginInput!) {
    loginUser(input: $input) {
      token
      user {
        id
        email
        username
        firstName
        lastName
        role
        managedClub {
          id
          name
        }
      }
    }
  }
`;

export interface RegisterResult {
  registerUser: User;
}
export interface RegisterVars {
  input: UserRegistrationInput;
}

export const REGISTER_USER: TypedDocumentNode<RegisterResult, RegisterVars> = gql`
  mutation RegisterUser($input: UserRegistrationInput!) {
    registerUser(input: $input) {
      id
      email
      username
      firstName
      lastName
      role
      managedClub {
        id
        name
      }
    }
  }
`;

export interface MeResult {
  me: User | null;
}

export const GET_ME: TypedDocumentNode<MeResult, Record<string, never>> = gql`
  query GetMe {
    me {
      id
      email
      username
      firstName
      lastName
      phone
      isActive
      role
      managedClub {
        id
        name
        city
      }
    }
  }
`;
