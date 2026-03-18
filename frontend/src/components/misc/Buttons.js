import tw from "twin.macro";
import styled from "styled-components";

export const PrimaryButton = tw.button`px-8 py-3 font-bold rounded bg-primary-500 text-gray-100 
hocus:bg-primary-700 hocus:text-gray-200 focus:shadow-outline focus:outline-none
transition duration-300`;

export const SecondaryButton = tw.button`px-8 py-3 rounded border-solid border border-primary-500 text-primary-400
hocus:border-primary-700 focus:shadow-outline focus:outline-none
transition duration-300`;

export const PrimarySmallButton = styled.button`
  ${tw`px-4 py-2 rounded border-solid border border-primary-500 bg-primary-500 text-gray-100 
  hocus:bg-primary-700 hocus:text-gray-200 focus:shadow-outline focus:outline-none 
  transition duration-300`};

  :disabled {
    ${tw`bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed`}
  }
`;

export const SecondarySmallButton = tw.button`px-4 py-2 rounded border-solid border border-primary-400 text-primary-400
hover:border-primary-700 hover:text-primary-700 focus:shadow-outline focus:outline-none
transition duration-300`;
