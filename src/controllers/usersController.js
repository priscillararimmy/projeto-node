const userService = require("../services/userService")
const { getData, UpdateData } = require("../utils/functions")

module.exports = {


    async index(req, res){
        const users = getData('users.json')
        // #swagger.tags = ['User']
        // #swagger.description = 'Endpoint que lista todos os usuários cadastrados.'
        return res.status(200).json({users: users})
    }, 
     


    async indexOne(req, res){
        const { id } = req.params

         // #swagger.tags = ['User']
        // #swagger.summary = 'Endpoint para buscar usuário pelo ID.'
    
        try {
            const response = await userService.getUserById(id)
            if(response.error) throw new Error(response.error)
            return res.status(200).json(response)

        } catch(error) {
            res.status(400).json({ error: error.message })
        }
    }, 

    
    async register(req, res){
        const { name, email } = req.body
        const users = getData('users.json')

        // #swagger.tags = ['User']
        // #swagger.summary = 'Endpoint para registrar um novo usuário.'

        //try 
        try {
            const createNewUser = [...users, 
                { id: users.length + 1, 
                 name: name,
                 email: email}]
         UpdateData(createNewUser)
         if (!name || !email ) {throw new Error("O campo é obrigatório.")}
         return res.status(201).send({message: 'Usuário salvo com sucesso!'})
        } catch(error) {
            res.status(400).json({ message: error.message })
        }
     
    },

    
    async updDate (req, res){
        const { id } = req.params
        if (!id) throw new Error("Id do usuário não informado")
        const users = getData('users.json')

        // #swagger.tags = ['User']
        // #swagger.summary = 'Endpoint dar um update no usuário'

        try {
            const existUser = users.find((item) => item.id === Number(id))
        
        const dataForUpdate = req.body

        if(!existUser){
            return res.status(200).send({message: "Não houve mudança de dados"})
        }

        const updateUsersList = users.map((item)=>{
            if(item.id === Number(id)){
                return {...item, ...dataForUpdate}
            }
            else{
                return {...item}
            }
        })
        UpdateData(updateUsersList)
        return res.status(200).send({message: "Usuário encontrado"})

        } catch (e) {
            res.status(404).json({ message: e.message })
        }
        
        }
}

