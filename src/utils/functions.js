const fileSystem = require('fs')


 const  getData = (fileName) => {
    const result = JSON.parse( fileSystem.readFileSync('./src/database/'+ fileName,'utf8'));
    return result
}

 const UpdateData = ( fileName, data) => {
    fileSystem.writeFileSync('./src/database/'+ fileName, JSON.stringify(data))
}

module.exports = {
    getData,
    UpdateData
}

