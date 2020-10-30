const User = require('../models/User');
const Company = require('../models/Company');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

//Token
const createToken = (user, secret, expiresIn) => {
    const { id, name, surname, email } = user;

    return jwt.sign({ id, name, surname, email }, secret, { expiresIn })
}   

//Resolvers
const resolvers = {
    //Queries
    Query: {
        //Users
        getUser : async (_, {}, ctx) => {
            return ctx.user;
        },

        getUserAdmin : async (_, { id }) => {
            //Review if user exist
            const user = await User.findById(id);

            if(!user) {
                throw new Error('El administrador no existe.');
            }
            
            return user;
        },

        getUsers : async () => {
            try {
                const users = await User.find({});
                return users;
            } catch (error) {
                console.log(error);
            }
        },

        //Companies
        getCompanies : async () => {
            try {
                const companies = await Company.find({}).sort({ companyName: 1 });
                return companies;
            } catch (error) {
                console.log(error);
            }
        },

        getCompany : async (_, { id }) => {
            //Review if company exist
            const company = await Company.findById(id);

            if(!company) {
                throw new Error('La empresa no existe.');
            }
            
            return company;
        },

        searchCompanies : async (_, { text }) => {
            const companies = await Company.find({ $text: { $search: text }}).sort({ companyName: 1 });
            return companies;
        },

        //Departments
        getDepartments : async () => {
            try {
                const departments = await Department.find({}).sort({ departmentName: 1 });
                return departments;
            } catch (error) {
                console.log(error);
            }
        },

        getDepartment : async (_, { id }) => {
            //Review if department exist
            const department = await Department.findById(id);

            if(!department) {
                throw new Error('El departamento no existe.');
            }
            
            return department;
        },

        searchDepartments : async (_, { text }) => {
            const departments = await Department.find({ $text: { $search: text }}).sort({ departmentName: 1 });
            return departments;
        },

        //Employees
        getEmployees : async () => {
            try {
                const employees = await Employee.find({}).sort({ name: 1 });
                return employees;
            } catch (error) {
                console.log(error);
            }
        },

        getEmployee : async (_, { id }) => {
            //Review if employee exist
            const employee = await Employee.findById(id);

            if(!employee) {
                throw new Error('El empleado no existe.');
            }

            return employee;
        },

        searchEmployees : async (_, { text }) => {
            const employees = await Employee.find({ $text: { $search: text }}).sort({ name: 1 });
            return employees;
        },
    },

    //Mutations
    Mutation: {
        //Users
        newUser : async (_, { input }) => {
            const { email, password } = input;

            //Review if the user has been register
            const userExist = await User.findOne({ email });
            if(userExist) {
                throw new Error('El correo ingresado ya existe.');
            }

            //Hash password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                const user = new User(input);
                user.save();
                return user;
            } catch (error) {
                console.log(error);
            }
        },

        authUser : async (_, { input }) => {
            const { email, password } = input;

            //If the user exist
            const userExist = await User.findOne({ email });
            if(!userExist) {
                throw new Error('El usuario no existe.');
            }

            //Review if correct password
            const correctPassword = await bcryptjs.compare(password, userExist.password);
            if(!correctPassword) {
                throw new Error('La contraseña es incorrecta.');
            }

            //Create token
            return {
                token: createToken(userExist, process.env.SECRET, '24h')
            }
        },

        updateUser : async (_, { id, input }, ctx) => {
            //Review if user exist
            let userAdmin = await User.findById(id);

            if(!userAdmin) {
                throw new Error('El administrador no existe.');
            }

            //Save at database
            userAdmin = await User.findOneAndUpdate({ _id: id }, input, { new: true });
            return userAdmin;
        },

        deleteUser : async (_, { id }, ctx) => {
            //Review if user exist
            let userAdmin = await User.findById(id);

            if(!userAdmin) {
                throw new Error('El administrador no existe.');
            }

            //Review if employees exist to user
            const employee = await Employee.find({ user: id });

            if(employee.length === 0) {
                //Review if departments exist to user
                const department = await Department.find({ user: id });

                if(department.length === 0) {
                    //Review if companies exist to user
                    const company = await Company.find({ user: id });

                    if(company.length === 0) {
                        //Delete user from database
                        await User.findOneAndRemove({ _id: id });
                        return 'El administrador ha sido eliminado correctamente.';
                    } 
                    else {
                        throw new Error('No puede eliminar este administrador mientras existan empresas asignadass al administrador.');
                    }
                }
                else {
                    throw new Error('No puede eliminar este administrador mientras existan departamentos asignados al administrador.');
                }
            }
            else {
                throw new Error('No puede eliminar este administrador mientras existan empleados asignados al administrador.');
            }
        },

        //Companies
        newCompany : async (_, { input }, ctx) => {
            const { companyName } = input;
            
            //Review if the company has been register
            const companyExist = await Company.findOne({ companyName });
            if(companyExist) {
                throw new Error('La empresa ingresada ya existe.');
            }

            const company = new Company(input);

            //Assing company to user
            company.user = ctx.user.id;

            try {
                company.save();
                return company;
            } catch (error) {
                console.log(error);
            }
        },

        updateCompany : async (_, { id, input }, ctx) => {
            //Review if company exist
            let company = await Company.findById(id);

            if(!company) {
                throw new Error('La empresa no existe.');
            }

            //Review if the token is correct
            if(company.user.toString() !== ctx.user.id) {
                throw new Error('No tiene los suficientes privilegios para modificar este registro.');
            }

            //Save at database
            company = await Company.findOneAndUpdate({ _id: id }, input, { new: true });
            return company;
        },

        deleteCompany : async (_, { id}, ctx) => {
            //Review if company exist
            let company = await Company.findById(id);

            if(!company) {
                throw new Error('La empresa no existe.');
            }

            //Review if the token is correct
            if(company.user.toString() !== ctx.user.id) {
                throw new Error('No tiene los suficientes privilegios para eliminar este registro.');
            }

            //Review if employees exist to company
            const employee = await Employee.find({ company: id });

            if(employee.length === 0) {
                //Review if departments exist to company
                const department = await Department.find({ company: id });

                if(department.length === 0) {
                    //Delete company from database
                    await Company.findOneAndRemove({ _id: id });
                    return 'La empresa ha sido eliminado correctamente.';
                }
                else {
                    throw new Error('No puede eliminar esta empresa mientras existan departamentos asignados a la empresa.');
                }
            }
            else {
                throw new Error('No puede eliminar esta empresa mientras existan empleados asignados a la empresa.');
            }
        },

        //Departments
        newDepartment : async (_, { input }, ctx) => {
            const { departmentName } = input;

            //Review if the department has been register
            const departmentExist = await Department.findOne({ departmentName });
            if(departmentExist) {
                throw new Error('El departamento ingresado ya existe.');
            }

            const department = new Department(input);

            //Assing department to user
            department.user = ctx.user.id;

            try {
                department.save();
                return department;
            } catch (error) {
                console.log(error);
            }
        },

        updateDepartment : async (_, { id, input }, ctx) => {
            //Review if department exist
            let department = await Department.findById(id);

            if(!department) {
                throw new Error('El departamento no existe.');
            }

            //Review if the token is correct
            if(department.user.toString() !== ctx.user.id) {
                throw new Error('No tiene los suficientes privilegios para modificar este registro.');
            }

            //Save at database
            department = await Department.findOneAndUpdate({ _id: id }, input, { new: true });
            return department;
        },

        deleteDepartment : async (_, { id}, ctx) => {
            //Review if department exist
            let department = await Department.findById(id);

            if(!department) {
                throw new Error('El departamento no existe.');
            }

            //Review if the token is correct
            if(department.user.toString() !== ctx.user.id) {
                throw new Error('No tiene los suficientes privilegios para eliminar este registro.');
            }

            //Review if employees exist to department
            const employee = await Employee.find({ department: id });

            if(employee.length === 0) {
                //Delete department from database
                await Department.findOneAndRemove({ _id: id });
                return 'El departamento ha sido eliminado correctamente.';
            }
            else {
                throw new Error('No puede eliminar este departamento mientras existan empleados asignados al departamento.');
            }
        },

        //Employees
        newEmployee : async (_, { input }, ctx) => {
            const { email } = input;

            //Review if the email has been register
            const employeeExist = await Employee.findOne({ email });
            if(employeeExist) {
                throw new Error('El empleado ingresado ya existe');
            }

            const employee = new Employee(input);

            //Assing employee to user
            employee.user = ctx.user.id;

            try {
                employee.save();
                return employee;
            } catch (error) {
                console.log(error);
            }
        },

        updateEmployee : async (_, { id, input }, ctx) => {
            //Review if employee exist
            let employee = await Employee.findById(id);

            if(!employee) {
                throw new Error('El empleado no existe.');
            }

            //Review if the token is correct
            if(employee.user.toString() !== ctx.user.id) {
                throw new Error('No tiene los suficientes privilegios para modificar este registro.');
            }

            //Save at database
            employee = await Employee.findOneAndUpdate({ _id: id }, input, { new: true });
            return employee;
        },

        deleteEmployee : async (_, { id }, ctx) => {
            //Review if employee exist
            let employee = await Employee.findById(id);

            if(!employee) {
                throw new Error('El empleado no existe.');
            }

            //Review if the token is correct
            if(employee.user.toString() !== ctx.user.id) {
                throw new Error('No tiene los suficientes privilegios para eliminar este registro.');
            }

            //Delete employee from database
            await Employee.findOneAndRemove({ _id: id });
            return 'El empleado ha sido eliminado correctamente.';
        },
    }
}

module.exports = resolvers;