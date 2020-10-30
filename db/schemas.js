const { gql } = require('apollo-server');

//Schemas
const typeDefs = gql`

    type User {
        id: ID
        name: String
        surname: String
        email: String
        created: String
    }

    type Token {
        token: String
    }

    type Company {
        id: ID
        companyName: String
        created: String
        user: ID
    }

    type Department {
        id: ID
        departmentName: String
        company: ID
        created: String
        user: ID
    }

    type Employee {
        id: ID
        name: String
        surnameP: String
        surnameM: String
        email: String
        birthdate: String
        gender: String
        phone: String
        cellphone: String
        created: String
        company: ID
        department: ID
        user: ID
    }

    input UserInput {
        name: String!
        surname: String!
        email: String!
        password: String
    }

    input AuthInput {
        email: String!
        password: String!
    }

    input CompanyInput {
        companyName: String!
    }

    input DepartmentInput {
        departmentName: String!
        company: ID!
    }

    input EmployeeInput {
        name: String!
        surnameP: String!
        surnameM: String!
        email: String!
        birthdate: String!
        gender: String
        phone: String
        cellphone: String
        company: ID!
        department: ID!
    }

    type Query {
        getUser : User
        getUserAdmin(id: ID!) : User
        getUsers : [User]

        getCompanies : [Company]
        getCompany(id: ID!) : Company
        searchCompanies(text: String!) : [Company]

        getDepartments : [Department]
        getDepartment(id: ID!) : Department
        searchDepartments(text: String!) : [Department]

        getEmployees : [Employee]
        getEmployee(id: ID!) : Employee
        searchEmployees(text: String!) : [Employee]
    }

    type Mutation {
        newUser(input: UserInput) : User
        authUser(input: AuthInput) : Token
        updateUser(id: ID!, input: UserInput) : User
        deleteUser(id: ID!) : String

        newCompany(input: CompanyInput) : Company
        updateCompany(id: ID!, input: CompanyInput) : Company
        deleteCompany(id: ID!) : String

        newDepartment(input: DepartmentInput) : Department
        updateDepartment(id: ID!, input: DepartmentInput) : Department
        deleteDepartment(id: ID!) : String

        newEmployee(input: EmployeeInput) : Employee
        updateEmployee(id: ID!, input: EmployeeInput) : Employee
        deleteEmployee(id: ID!) : String
    }

`;

module.exports = typeDefs;