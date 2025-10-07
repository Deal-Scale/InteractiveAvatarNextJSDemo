Documentation
Pricing
Enterprise
Sign in
Sign up
Community

    Guides
    Questions
    Comparisons
    Blog

Documentation
Back to Scaling Node.js Applications guides
A Complete Guide to Zod
TypeScript
Zod
Stanley Ulili
Updated on February 10, 2025

Zod is a TypeScript-first schema validation library that provides a simple and powerful way to define, validate, and transform data structures.

Zod is widely used in various applications, including API validation, form validation, and runtime type checking. With its declarative schema definitions and built-in TypeScript support, Zod simplifies ensuring data integrity and preventing runtime errors.

This article will guide you through creating a Zod validation system in your TypeScript application. You will learn to leverage its features to define schemas, validate data, handle errors gracefully, and integrate it into real-world applications.

Lets get started!
Prerequisites

Before proceeding with the rest of this article, ensure you have a recent version of Node.js and npm installed on your machine. Additionally, you should be familiar with basic TypeScript concepts, as Zod is primarily designed for TypeScript applications.
Setting up the project directory

In this section, you will set up a TypeScript development environment with TSX to run TypeScript files directly. This setup allows you to write and execute TypeScript code efficiently without a separate compilation step.

Start by creating a new directory and navigating into it:

mkdir zod-validation && cd zod-validation

Initialize the project with:

npm init -y

Following that, set the project to use ES modules:

npm pkg set type=module

Install Zod as well as other TypeScript dependencies:

npm install zod

npm install --save-dev typescript tsx

The TypeScript dependencies include:

    typescript: The TypeScript compiler and language service
    tsx: A CLI command that allows running TypeScript files directly, similar to how node runs JavaScript files

Next, generate a TypeScript configuration file:

npx tsc --init

Before creating the main TypeScript file, update the package.json file to include a convenient script for running the project:
package.json

{
...
"scripts": {
"dev": "tsx index.ts"
}
}

Now, once the main file is created, you can execute the project using:

npm run dev

With this setup, your TypeScript environment is ready, allowing you to run TypeScript files using TSX.
Getting started with Zod

In this section, you will learn how to create and use Zod schemas to validate data types in your TypeScript application. Zod provides a type-safe way to validate data at runtime while maintaining strong TypeScript integration.

Create a new file validation.ts in your project directory and add the following code:
validation.ts

import { z } from "zod";

const UserSchema = z.object({
name: z.string(),
age: z.number(),
email: z.string().email(),
});

export default UserSchema;

This snippet defines a schema for a user object, ensuring that:

    name is a string.
    age is a number.
    email is a valid email string.

Now, let's validate some sample data using this schema. Create a new file index.ts and add the following code:
index.js

import UserSchema from './validation';

const userData = {
name: 'Alice',
age: 25,
email: 'alice@example.com',
};

const result = UserSchema.safeParse(userData);

if (result.success) {
console.log('Valid user data:', result.data);
} else {
console.error('Validation errors:', result.error.format());
}

In this script, you import the UserSchema from the validation.ts file, which defines the expected user data structure. The safeParse method validates userData against this schema.

    If userData matches the schema, safeParse returns an object with success: true, and the validated data is logged to the console.
    If the validation fails, safeParse returns an object with success: false, and the format() method provides a structured error message showing which fields are invalid and why.

This approach ensures that the input data is correctly validated before being used in the application, helping to prevent potential issues caused by unexpected or malformed data.

Run the script using:

npm run dev

If the input data is valid, the script will print the validated data:
Output

Valid user data: { name: 'Alice', age: 25, email: 'alice@example.com' }

Now that you know how to get started with Zod, you will customize validation in Zod.
Customizing validations in Zod

Zod provides a rich set of built-in validation utilities that allow you to enforce constraints beyond basic type checking. You can customize your schema by adding conditions, refining values, or chaining multiple validation rules.
Adding constraints

You can enforce specific constraints on values using Zod's built-in methods. Let's enhance our UserSchema to include more detailed validations:
validation.ts

import { z } from "zod";

const UserSchema = z.object({
name: z.string().min(3, "Name must be at least 3 characters long"),

age: z.number().int().positive("Age must be a positive integer"),

email: z.string().email("Invalid email format"),

password: z.string().min(8, "Password must be at least 8 characters long"),

});

export default UserSchema;

Here's what each constraint does:

    .min(3, "Message"): Ensures that name has at least 3 characters.
    .int(): Ensures that age is an integer.
    .positive("Message"): Ensures that age is a positive number.
    .email("Message"): Ensures that email is in a valid format.
    .min(8, "Message"): Ensures that password is at least 8 characters long.

To test these constraints, modify the index.ts file to include invalid data:
index.js

import UserSchema from './validation';

const invalidUserData = {

name: 'Al', // Too short

age: -5, // Negative age

email: 'not-an-email', // Invalid email format

password: '123', // Too short

};

const result = UserSchema.safeParse(invalidUserData);

if (result.success) {
console.log('Valid user data:', result.data);
} else {
console.error('Validation errors:', result.error.format());
}

With the invalid data in place, run the script:

npm run dev

You will see output that looks similar to this:
Output

Validation errors: {
\_errors: [],
name: { \_errors: [ 'Name must be at least 3 characters long' ] },
age: { \_errors: [ 'Age must be a positive integer' ] },
email: { \_errors: [ 'Invalid email format' ] },
password: { \_errors: [ 'Password must be at least 8 characters long' ] }
}

The output is a structured error object from Zod, where \_errors at the root level is empty since there are no global errors.

Each invalid field (name, age, email, password) has its own \_errors array containing specific validation messages.

This format makes it easy to pinpoint which fields failed and why.

The output clearly identifies which fields failed validation and provides helpful error messages.
Refining values

Zod allows further validation through .refine(), which enables custom validation logic.

In the validation.ts file, enhance the password validation in the UserSchema:
validation.ts

const UserSchema = z.object({
...
email: z.string().email("Invalid email format"),
password: z.string()

    .min(8, "Password must be at least 8 characters long")

    .refine(password => /\d/.test(password), {

      message: "Password must contain at least one number"

    }),

});

This adds a requirement that passwords must contain at least one number when testing with invalid data.

Next, update the password to include only letters:
index.ts

const invalidUserData = {
name: 'Alice',
age: 25,
email: 'alice@example.com',
password: 'password', // Missing a number

};

When you run the program, the validation will fail with the following:
Output

Validation errors: {
...
password: { \_errors: [ 'Password must contain at least one number' ] }
}

Chaining multiple validations

You can also chain multiple validations together. This allows you to create more complex validation rules by combining multiple constraints in a sequence. Each validation will be checked in order, and all must pass for the data to be considered valid.

To start, update the name field in validation.ts as follows:
validation.ts

const UserSchema = z.object({
name: z.string()

    .min(3, "Name must be at least 3 characters long")

    .max(50, "Name cannot exceed 50 characters")

    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

age: z.number().int().positive("Age must be a positive integer"),
...
});

Now, the name field must adhere to multiple requirements. It must be between 3 and 50 characters in length, ensuring that names are neither too short nor excessively long.

Additionally, it can only contain letters and spaces, preventing the use of numbers, special characters, or symbols.

Next, update the invalidUserData object to include a name with numbers:
index.ts

...
const invalidUserData = {
name: "Alex123", // Too short

age: -5, // Negative age
email: "not-an-email", // Invalid email format
password: "password", // Missing a number
};
...

Now run the main file:

npm run dev

Output

Validation errors: {
\_errors: [],
name: { \_errors: [ 'Name can only contain letters and spaces' ] },
...
}

As you can see, the validation error message now shows that the name field contains invalid characters.
Handling errors gracefully in Zod

Zod provides a structured way to handle validation errors, making it easy to display meaningful error messages to users and debug issues efficiently. This section focuses on how to manage and present errors effectively.

You've already seen safeParse() in previous sections. It doesn't throw errors but instead returns an object containing either valid data or validation errors:
Output

{
"name": { "\_errors": ["Name can only contain letters and spaces"] },
...
}

Another option is parse(), which throws an error if validation fails. Modify your code to use parse() instead:
index.ts

import { z } from "zod";

const invalidUserData = {
name: "Alex123", // Too short
age: -5, // Negative age
email: "not-an-email", // Invalid email format
password: "password", // Missing a number
};

try {

const validUser = UserSchema.parse(invalidUserData);

console.log("Valid user:", validUser);

} catch (error) {

if (error instanceof z.ZodError) {

    console.log("Validation errors:", error.errors);

} else {

    console.error("Unexpected error:", error);

}

}

If the data meets all validation rules, it is parsed successfully, and the valid user object is logged. However, a ZodError is thrown if the data fails validation.

The catch block then checks the type of error—if it is a ZodError, the specific validation errors are logged. If the error is different, it is treated as an unexpected error and logged accordingly.

Now when you run this code, you will see:
Output

Validation errors: [
{
validation: 'regex',
code: 'invalid_string',
message: 'Name can only contain letters and spaces',
path: [ 'name' ]
},
{
code: 'too_small',
minimum: 0,
type: 'number',
inclusive: false,
exact: false,
message: 'Age must be a positive integer',
path: [ 'age' ]
},
....
]

The error.errors array contains detailed validation issues, each with:

    code: The type of error (e.g., too_small, invalid_string)
    message: The error message
    path: The field where the error occurred
    Additional context-specific properties like minimum for length validations

Mapping validation errors

In the previous section, you saw Zod's raw error format, which can be verbose and complex when handling validation errors. The raw format includes an array of error objects containing the error code, message, path, and additional validation-specific properties.

While this detailed format is helpful for debugging, it's often too complex to display to users or handle in application logic.

Let's create a helper function that maps these detailed error objects to a simple field-message structure:
index.ts

...
function formatZodErrors(error: z.ZodError) {

return error.errors.reduce((acc, err) => {

    const field = err.path.join(".");

    acc[field] = err.message;

    return acc;

}, {} as Record<string, string>);

}

try {
const validUser = UserSchema.parse(invalidUserData);
console.log("Valid user:", validUser);
} catch (error) {
if (error instanceof z.ZodError) {
const formattedErrors = formatZodErrors(error);

    console.log("Formatted validation errors:", formattedErrors);

}
}

The formatZodErrors function transforms the error array using reduce. For each error, it extracts the field name from the error's path array using join("."), creating a simple mapping between field names and their corresponding error messages.

When you run the file, you'll see the errors in a much cleaner format:
Output

Formatted validation errors: {
name: 'Name can only contain letters and spaces',
age: 'Age must be a positive integer',
email: 'Invalid email format',
password: 'Password must contain at least one number'
}

This mapped format helps:

    Display errors in forms
    Send clear API validation responses
    Retrieve field-specific errors quickly
    Handle nested object validation efficiently

The simplicity of the field-to-message mapping makes it much easier to work with than the raw error format while retaining all the essential information for user feedback.
Type inference and TypeScript integration

In this section, you will learn how Zod integrates with TypeScript to provide automatic type inference from your schemas. This ensures your validation rules and TypeScript types stay synchronized, eliminating the need for separate type definitions.

Often in TypeScript projects, you need to maintain separate type definitions and validation logic:

interface User {
name: string;
age: number;
email: string;
}

function validateUser(data: User) {
...
}

When using TypeScript with Zod, you don't need to define interfaces or types manually. Instead, Zod can automatically infer the correct TypeScript types from your schema definitions.

Let's start with this basic schema:
validation.ts

import { z } from "zod";

const UserSchema = z.object({
name: z.string().min(3, "Name must be at least 3 characters"),
age: z.number().positive("Age must be positive"),
email: z.string().email("Invalid email format"),
});

type User = z.infer<typeof UserSchema>;

export { UserSchema, type User };

The z.infer utility extracts the TypeScript type from our Zod schema. Typescript infers this as:

// TypeScript infers this type:

type User = {
name: string;
age: number;
email: string;
}

While TypeScript only captures the basic types, Zod maintains the full validation rules, such as minimum length and email format.

Now, update your code to use the inferred User type along with Zod’s validation:
index.ts

import { UserSchema, type User } from "./validation";

// TypeScript knows exactly what fields are required
const userData: User = {
name: "Alice",
age: 25,
email: "alice@example.com"
};

const result = UserSchema.safeParse(userData);
if (result.success) {
console.log("Valid user:", result.data);
} else {
console.error("Validation errors:", result.error.format());
}

Since TypeScript already enforces correct types, this ensures that any errors at runtime come from Zod’s additional validation rules. When you run the script:
Output

Valid user: { name: 'Alice', age: 25, email: 'alice@example.com' }

You can also extend the existing schema to include optional fields while ensuring TypeScript correctly infers them as optional in the type definition.

Create a new file extended.ts that builds upon UserSchema:
extended.ts

import { z } from "zod";
import { UserSchema } from "./validation";

const ExtendedSchema = UserSchema.extend({
phoneNumber: z.string().optional()
});

type ExtendedUser = z.infer<typeof ExtendedSchema>;
// TypeScript infers this as:
// type ExtendedUser = {
// name: string;
// age: number;
// email: string;
// phoneNumber?: string | undefined;
// }

const userData: ExtendedUser = {
name: "Alice",
age: 25,
email: "alice@example.com"
// phoneNumber can be omitted since it's optional
};

console.log("Valid:", ExtendedSchema.safeParse(userData).success);

This code builds upon the existing UserSchema by adding an optional phoneNumber field. Using UserSchema.extend(), the schema is expanded while preserving its original structure. TypeScript automatically infers the updated type, recognizing phoneNumber as optional.

When ExtendedSchema.safeParse(userData) runs, Zod validates the data while TypeScript ensures type safety at compile time. If phoneNumber is omitted, the validation still passes, demonstrating how Zod enables flexible yet strict data validation while keeping TypeScript types in sync.

Run the script:

npx tsx extended.ts

Output

Valid: true

As you can see, the combination of TypeScript's compile-time checks and Zod's runtime validation ensures your data is always valid and correctly typed.
Integrating Zod with web frameworks

Zod can validate different parts of your Express requests, ensuring data integrity before it reaches your route handlers. Each part of an HTTP request can be validated differently based on its specific requirements.
Validating request bodies

Request bodies typically contain the most complex data structures and require thorough validation. When clients send POST or PUT requests, you'll want to ensure the data matches your expected format:

const UserSchema = z.object({
name: z.string().min(3),
email: z.string().email()
});

app.post("/users", (req, res) => {
const result = UserSchema.safeParse(req.body);
if (!result.success) {
return res.status(400).json({ errors: result.error.format() });
}
// result.data is now typed and validated
});

This validates that all required fields are present and properly formatted. If validation fails, clients receive structured error messages explaining exactly what went wrong.
Validating query parameters

Query parameters present unique challenges because they always come as strings and often need type conversion. They're also frequently optional with default values:

const QuerySchema = z.object({
page: z.string().regex(/^\d+$/).transform(Number),
sort: z.enum(["asc", "desc"]).default("asc")
});

app.get("/users", (req, res) => {
const result = QuerySchema.safeParse(req.query);
// Converts page to number and ensures sort is valid
});

The transform method is beneficial here, as it automatically converts string values to their proper types while maintaining type safety.
Validating route parameters

Route parameters usually need strict validation since they identify specific resources. Invalid parameters should be caught early to avoid unnecessary database lookups:

const ParamsSchema = z.object({
userId: z.string().uuid()
});

app.get("/users/:userId", (req, res) => {
const result = ParamsSchema.safeParse(req.params);
// Only proceeds if userId is a valid UUID
});

This ensures that requests with malformed IDs fail fast, protecting your database queries from invalid input.
Validating API responses

Response validation helps catch bugs in your own code by ensuring you're sending data in the correct format:

const ResponseSchema = z.object({
id: z.string(),
data: z.array(z.string())
});

const response = ResponseSchema.parse(data);
res.json(response); // Guaranteed to match schema

This is particularly important when your API contract needs consistency, such as providing data to multiple client applications.

Using Zod's error formatting, you can provide clear, actionable feedback when validation fails, helping API consumers quickly identify and fix issues in their requests.
Final thoughts

This article explored Zod, a TypeScript-first validation library that simplifies data validation through declarative schema definitions, error handling, and TypeScript integration.

With this knowledge, you should now be able to confidently use Zod in your projects to ensure data integrity and simplify validation workflows.
Author's avatar
Article by
Stanley Ulili
Stanley Ulili is a technical educator at Better Stack based in Malawi. He specializes in backend development and has freelanced for platforms like DigitalOcean, LogRocket, and AppSignal. Stanley is passionate about making complex topics accessible to developers.
Got an article suggestion? Let us know
Next article
A Complete Guide to Joi
Learn how to use Joi for robust data validation in JavaScript and TypeScript. This step-by-step guide covers schema creation, custom error handling, conditional logic, and integrating Joi with TypeScript for type-safe runtime validation. Includes examples, best practices, and a comparison to Zod.
→
Licensed under CC-BY-NC-SA

This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

    Basics
        Express and Pug
        NVM Alternatives
        Debugging Node.js Apps
        Solutions to Common Node.js Errors
        Using TypeScript with Node.js
        Understanding TypeScript Generics
        Deno Overview for Node.js Users
        Introduction to Bun for Node.js Users
        Node.js vs Deno vs Bun
        What's New in Express.js v5.0
        CommonJS vs. ES Modules
        Express.js vs Fastify
        Building Node.js Apps with Fastify
        A Complete Guide to Zod
        A Complete Guide to Joi
        Getting Started with Yup
        Beginner's Guide to TypeBox
        Joi vs Zod
        Yup vs Zod
        TypeBox vs Zod
        TypeBox vs Joi
        Express Error Handling Patterns
        Next.js Error Handling Patterns
        NestJS Error Handling Patterns
        Remix Error Handling Patterns
        Exploring the Temporal API
        Prisma ORM for Node.js
        The Definitive Guide to Commander.js
        Building Web APIs with Express
        Building Web APIs with Fastify
        Getting Started with PNPM
        Getting Started with Yarn
        Getting Started with Sequelize ORM
        Getting Started with Drizzle ORM
        Getting Started with MikroORM
        Beginner's Guide to Knex.js
        Getting Started with Kysely
        Drizzle vs Prisma
        A Beginner's Guide to NVM
        A Practical Guide to Execa for Node.js
        Uploading Files with Multer in Node.js
        Prettier vs ESLint
        Parcel vs Vite: Choosing the Right Frontend Build Tool
        JSON Schema Validation with Ajv
        Native SQLite in Node.js
        TypeORM vs. MikroORM
        Kysely vs. Knex.js
        Knex vs Prisma
        Moment.js alternatives
        Express Alternatives
        The Definitive Guide to Valibot
        Parsing CSV Files with Papa Parse
        Vitest vs Jest
        Vite.js: A Beginner's Guide
    Deploying to Production
    Practical Performance Tuning
    Testing
    Observability & Monitoring
    Job Scheduling

Make your mark
Join the writer's program

Are you a developer and love writing and sharing your knowledge with the world? Join our guest writing program and get paid for writing amazing technical guides. We'll get them to the right readers that will appreciate them.
Write for us
Writer of the month
Marin Bezhanov
Marin is a software engineer and architect with a broad range of experience working...
Build on top of Better Stack

Write a script, app or project on top of Better Stack and share it with the world. Make a public repository and share it with us at our email.
community@betterstack.com

or submit a pull request and help us build better products for everyone.

See the full list of amazing projects on github
Platform
Enterprise
Uptime
Telemetry
Solutions
Log management
Infrastructure monitoring
Uptime monitoring
Website monitoring
Incident management
Status page
Incident silencing
Slack-based incident management
Dashboards
Integrations
Resources
Help & Support
Uptime docs
Logs docs
Community
Guides
Questions
Comparisons
Blog
Write for us
Company
Work at Better Stack
Engineering
Security
Compare
Pingdom
Pagerduty
StatusPage.io
Uptime Robot
StatusCake
Opsgenie
VictorOps
From the community
What Is Incident Management? Beginner’s Guide
How to Create a Developer-Friendly On-Call Schedule in 7 steps
8 Best Free & Open Source Status Page Tools in 2024
10 Best API Monitoring Tools in 2024
5 Most Used Incident Management Tools (Reviewed & Ranked)

Better Stack lets you see inside any stack, debug any issue, and resolve any incident.
+1 (628) 900-3830
hello@betterstack.com
Terms of Use
Privacy Policy
GDPR
System status
© 2025 Better Stack, Inc.
