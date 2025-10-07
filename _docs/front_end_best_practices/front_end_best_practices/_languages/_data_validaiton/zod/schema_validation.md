Ultimate Guide To Schema Validation with Zod
Munir Abdullahi
Munir Abdullahi
9 min read
·
May 27, 2024

With the rapid development of modern applications, data integrity is paramount. As often said, a developer should never trust user inputs. Therefore, user data has to be in a conformed structure or schema.

This can be achieved using a powerful schema library called Zod. When TypeScript is integrated with Zod, type safety can be extended to the data layer. Also, Zod extends the compile-time type checking of TypeScript to runtime, which ensures that unexpected data is blocked.

This blog post will introduce schema validation, explain what Zod is and how to set it up, discuss some of its basic features, and delve into other complex features.
Introduction to Schema Validation

This section discusses the concept of schema validation and the fundamental requirements to maintain uniformity in data structures.

Schema validation is the process of ensuring that incoming user data conforms with certain specifications. Imagine security personnel at a nightclub checking to see if everyone is wearing the appropriate dress code. This is what schema validation does. The dress code is the schema in this example.

A schema is a predefined set of rules that sets a structure, format, and constraints for the data. It typically states how data should look in an application.

Depending on the project, the criteria for schema validation can vary. However, the following are the fundamental requirements to ensure uniformity in data:

    Data types: It ensures that the data conforms to a specific data type.
    Field constraint: It sets constraints like the maximum or minimum length of a particular field.
    Required Fields: It specifies which field is mandatory or not.

Introducing Zod

This section explains what Zod is, its key features, and how to install and get started with it.

Zod is a schema declaration and validation library used in mostly TypeScript projects. It defines and validates data structures and ensures easy integration into Typescript projects.

It offers simple and expressive syntax that can deliver concise and well-structured schema. It allows the definition of data types and constraints, providing a good understanding of expected data in the codebase.

Zod offers runtime validation. It means it continues to validate the data even after TypeScript code has been translated into JavaScript, adding extra security to the application development process.

Here are some key features of Zod:

    Schema definition: Zod’s simple syntax makes it easy for developers to define data structures, types, and set constraints.
    Seamless integration: Zod integration with TypeScript is an easy one. However, it can also be used in JavaScript.
    Built-in validators: Zod offers built-in validators for validating emails, strings, etc.
    Custom validation: Custom validation logic implementation is straightforward in Zod. It offers flexibility to validate data based on project-specific requirements.
    Composability: Zod schemas can be reused and composed into a more complex data structure.

Installation and Setup

There are a few requirements before using Zod in this guide. There are:

    Vite project. Execute npm create vite@lateston the terminal. Note that you don’t need to know anything about Vite. It will enable us to work in a TypeScript environment.
    Node.js
    TypeScript 4.5+

To install Zod, run npm install zodon the terminal.
Tutorial file structure

The main code will be implemented in the main.ts file. To run this file, execute npm run devon the terminal.
Basic Schema Validation

This section explores validations for data types, both primitives and objects.
Zod Data Types

The following are some of the Zod data types to be focused on:

    z.string()
    z.number()
    z.boolean()
    z.date()
    z.enum()
    z.object()

These data types can be used to build schema validation.

import { z } from "zod";
const UserSchema = z.object({
 username: z.string(),
});
const user = { username: "John" };
const result = UserSchema.safeParse(user);
console.log(result);

Firstly, the z object is imported, and it enables the creation of a data schema.

Secondly, theUserSchema is defined with the z.object method that specifies an object expecting a username property whose value should be a string.

Lastly, an user object is defined with the property username. The safeParse method includes the parsed object and a message indicating whether the validation was successful or not.

Here is the result on the browser console.

Suppose a number is passed as the value to the property username; an error will occur.

Here is the result if an error occurs.

More properties can be added to the UserSchema object along with validations.

const UserSchema = z.object({
 fullName: z.string().trim(),
 username: z.string().min(5).max(9),
 email: z.string().email(),
 address: z.string().min(5).max(50),
 phoneNumber: z.string().length(13).startsWith("+234").trim(),
 height: z.number().positive().gt(170),
 yearsOfExperience: z.number().gte(2),
 numberOfDependants: z.number().lte(3),
 age: z.number().gte(18).int(),
 dateOfBirth: z.date().max(new Date("2006–01–01")).min(new Date("1900–01–01")),
 isMarried: z.boolean(),
 isProgrammer: z.boolean().default(true),
 website: z.string().url(),
 hobby: z.enum(["Programming", "Weight Lifting", "Music"]),
});

It is important to note that, by default, Zod expects every property to be defined. To avoid this, specify the optional() validation.

    min(): Specifies the minimum number of characters.
    max(): Specifies the maximum number of characters.
    length(): Specifies the exact number of characters.
    email(): Specifies a property that must adhere to the standard email format.
    url(): Specifies a property that must adhere to a standard URL address.
    trim(): Remove whitespace.
    gte(): Specifies that a property value must be greater than or equal to a specified number.
    lte(): Specifies that a property value must be less than or equal to a specified number.
    gt(): Specifies that a property value must be greater than a specified number.
    startsWith(): Specifies that a string must start with a particular sub-string.
    positive(): Specifies that a number must be positive.
    int(): Specifies that a number must be an integer.
    max(new Date()): Specifies the maximum date of a property.
    min(new Date())min(new Date())`: Specifies the minimum date of a property.
    enum(): Specifies a list of values that can be accepted.

The following is an example of an object that fits the above schema.

const user = {
 username: "john_doe",
 fullName: "John Doe",
 phoneNumber: "+234812345678",
 email: "john.doe@example.com",
 address: "123 Main Street, Lagos",
 height: 175,
 yearsOfExperience: 7,
 numberOfDependants: 2,
 age: 39,
 dateOfBirth: new Date("1985–01–01"),
 isMarried: true,
 isProgrammer: true,
 website: "https://www.johndoe.com",
 hobby: "Music",
}

Here is the result.
Error handling and Error Customization

Every error in Zod is an instance of the ZodError class. This class is a subclass of the JavaScript Error class.

class ZodError extends Error {
 issues: ZodIssue[];
}

The issues property holds an array named ZodIssue. This array holds the problems that may have occurred during validation. The following fields exist in every ZodIssue.

    code: This identifies the type of error that occurred.
    path: This indicates the location of the error.
    message: This provides a detailed explanation of the error.

Error handling is achieved by executing the JavaScript try and catch technique.

import {z, ZodError} from "zod"
const UserSchema = z.object({
 username: z.string(),
 age: z.number()
})
const user = {username:'John', age:'24'}
try {
 console.log(
 UserSchema.parse(user));
}
catch (error) {
 if (error instanceof ZodError) {
 console.log(error.issues)
 }
}

The age property in the user object is passed as a string instead of a number. Zod will throw a ZodError and the catch block will get the error information.

Errors can be customized with the z.ZodErrorMap error mapping function. With this function, a specific error message can be defined for different validation issues that may occur.

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
 if (issue.code === z.ZodIssueCode.invalid_type) {
 if (issue.expected === "string") {
 return { message: "bad type!" }
 }
 }
 return { message: ctx.defaultError }
}
z.setErrorMap(customErrorMap)

The ZodErrorMap function takes two arguments; issue and ctx. issue represents a specific validation issue whilectx gives extra insights on error mapping.

z.string().parse(23, { errorMap: customErrorMap })

The code above returns a ZodError which contains the customized error message, bad typesince it’s expecting a string.
Zod Refinements

Certain validation types aren’t available in the TypeScript type system. Zod implements these TypeScript validation features.

As such, Zod refinement feature offers two APIs that implement additional custom validation functions. The refine() method creates refinements. It takes two arguments:

    A validation function.
    An optional object with options that specify custom error-handling behavior.

The refine() method to customize the validation of a user’s age.

const UserSchema = z.object({
 age: z.number().refine((age) => age >= 18, {
 message: 'Age must be at least 18'
 })
})

In this example, refine() is used to validate the age property. The function passed into the method checks if age is greater than or equal to 18. If it is less than 18, it returns a false value.
The refine() method can be asynchronous. In this case, data must be parsed and validated using the parseAsync() method else an error will occur.

const UserSchema = z.object({
 username: z.string().refine(async (username) => username.length <= 9 && username.length >= 5, {
 message: 'username must be at most 9 characters and at least 5 characters'
 })
})
const user = { username: "JohnDoe" }
await UserSchema.parseAsync(user)

In the example above, the data is validated asynchronously against the schema.

The second refinement method is superRefine(). It is more versatile than the refine() method. It accepts a function with two arguments, namely:

    data: Parsed data being validated.
    ctx: A context object with a method called `addIssue`.

const UserSchema = z.string().superRefine((val, ctx) => {
 if (val.length>=9) {
 ctx.addIssue({
 code: z.ZodIssueCode.too_big,
 maximum: 9,
 type: 'string',
 inclusive: true,
 message: "Username should be at least 5 characters and at most 9 characters",
 })
 }
})

The superRefine() method validates the length of a string. If the length of the string is greater than 9, it returns an error code with a very concise customized error message.
Zod Custom Validation

Zod provides two approaches to custom validation. These approaches involve using the refine() and superRefine() methods. It offers more flexibility, precise error reporting, and modularization.

import { z } from "zod"
const UserSchema = z
 .object({
 username: z.string({
 required_error: "Username is required",
 invalid_type_error: "Username must be a string",
 }),
 email: z
 .string({
 required_error: "Email is required",
 invalid_type_error: "Email must be a string with valid email format",
 })
 .email(),
 password: z
 .string({
 required_error: "Email is required",
 invalid_type_error: "Password must be more than 5 characters",
 })
 .min(5),
 confirmPassword: z.string().min(4),
 })
 .superRefine(({ confirmPassword, password }, ctx) => {
 if (confirmPassword !== password) {
 ctx.addIssue({
 code: "custom",
 message: "The passwords did not match",
 })
 }
 })

In the above example, custom error message validation was created for every property using the required_error and the invalid_type_error options. The superRefine() method adds custom validation logic to the password and confirmPassword fields. A custom error message occurs If these fields don’t match

const user = {
 username: 'johndoe',
 email: 'johndoe@gmail.com',
 password: 'johndoe',
 confirmPassword:'johndoe'
}

The above object matches the custom validation rules defined in the UserSchema.
Type Inference

Zod integrates well with TypeScript in that it leverages TypeScript’s type inference. It uses static type to check the data against the schema.

import { z } from "zod"
const UserSchema = z.object({
 username: z.string(),
 email: z.string(),
 phoneNumber: z.string().optional()
})
type User = z.infer<typeof UserSchema>

The UserSchema is defined and z.inferinfers the TypeScript type User based on the UserSchema. The type of the User will be derived from the UserSchema object.

const user: User = {
 username: 'johndoe',
 email: 'johndoe@gmail.com',
 phoneNumber:'08123456789'
}

The user object is defined as an instance of the User type. The userobject must adhere to the structure of the User type.
Conclusion

Schema validation is a necessary functionality in application development as it ensures data integrity. Zod is one tool used to achieve this. It offers many features, and in this article, we have covered enough information to get started in schema validation.

We started by learning about some data types available in Zod and how to use them to build a robust data schema. It can validate user input at runtime and how it can integrate with TypeScript. We further explored more complex features like error handling and custom validations.

Zod flexibility and reliability have made it a necessary tool as it helps developers reduce errors, build high-performance applications, and provide data integrity.
Resources

    Zod Error Handling Documentation
    TypeScript Type Inference