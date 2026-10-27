const { z } = require('zod');
const { PLATFORMS } = require('../models/Game');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'invalid id');

const createUserSchema = z.object({
  username: z.string().trim().min(3, 'username must be at least 3 characters').max(30),
  email: z.email('email is not valid'),
  fullName: z.string().trim().min(2, 'fullName is required'),
  country: z.string().trim().optional()
});

const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'category name must be at least 2 characters'),
  description: z.string().optional()
});

const createGameSchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  description: z.string().optional(),
  developer: z.string().trim().min(1, 'developer is required'),
  price: z.number().min(0, 'price cannot be negative'),
  stock: z.number().int('stock must be a whole number').min(0, 'stock cannot be negative'),
  category: objectId,
  platforms: z.array(z.enum(PLATFORMS)).min(1, 'game must have at least one platform'),
  releaseDate: z.coerce.date().optional()
});

// on update every field is optional, but at least one has to be sent
const updateGameSchema = createGameSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'nothing to update' });

const createOrderSchema = z.object({
  user: objectId,
  items: z
    .array(
      z.object({
        game: objectId,
        quantity: z.number().int('quantity must be a whole number').min(1, 'quantity must be at least 1')
      })
    )
    .min(1, 'order must contain at least one item')
});

module.exports = {
  createUserSchema,
  createCategorySchema,
  createGameSchema,
  updateGameSchema,
  createOrderSchema
};
