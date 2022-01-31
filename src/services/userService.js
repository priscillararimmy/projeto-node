const { getData } = require("../utils/functions")

module.exports = {
    async getUserById(id){
        const users = getData('users.json')
        try {
            const userID = users.find((item) => item.id === Number(id))

            if(!userID){
                throw new Error('Não tem usuário na lista com esse id')
            }
            return {userID: userID}

        } catch (error) {
            return { error: error.message }
        }
    }
}