import { TransformFnParams } from 'class-transformer';

// Quita los espacios del principio y del final antes de validar.
// Así "    " queda vacío y lo rechaza @IsNotEmpty (sin esto, llegaría a Mongo y fallaría con un 500).
export const recortar = ({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value);