const xlsxPopulate = require("xlsx-populate");
const { getJsDateFromExcel } = require("excel-date-to-js");
const { UpdateData, getData } = require("../utils/functions");

module.exports = {

    async totalTransactions(req, res) {
        const { userID } = req.params;
        const { year, type } = req.query;
    
        const users = await getData("users.json");
        const transactions = await getData("financial.json");
    
        /* 
        #swagger.tags = ['Finantials']
        #swagger.description = 'Endpoint para buscar as transações de um usuário exibindo seus totais por ano/mês.'
        **/
    
        
        const existUser = users.find((user) => user.userID === Number(userID));
        if (!existUser) {
          return res.status(404).send({ message: `Nenhum usuário encontrado com id ${userID}.` });}
    
        
        const existFinancial = transactions.find(
          (financial) => financial.userID === existUser.userID && t.financialData.length > 0
        );
    
        if (!existFinancial) {
          return res.status(404).send({message: 'Esse usuário não tem nenhuma transação'});
        }
        
        const priceUser = existFinancial.financialData.map((financial) => financial.price);
    
        const sumUser = priceUser.reduce(
          (prevValue, currValue) => prevValue + currValue
        );
    
        const dateFromUser = existFinancial.financialData.map((fiancial) => financial.date);
        const financialYear = dateFromUser.map((d) => new Date(d).getFullYear());
        const yearQueryFound = financialYear.find((y) => y === Number(year));
        const yearMatch = financialYear.find((y) => y === yearQueryFound);
    
        if (year && !yearMatch) {
          return res.status(404).send({
            message: `Não há transações no ${year}`,
          });
        }
    
        if (!year && type) {
          return res.status(404).send({message: `Informe o ano`});
        }
        
        const userfinancialYear = existFinancial.financialData.filter((t) => {
          if (new Date(t.date).getFullYear() === Number(year)) {
            return t;
          }
        });
        
        const typeMatch = userfinancialYear.find((t) => t.typeOfExpenses === type);
    
        if (year && type && !typeMatch) {
          return res.status(404).send({message: 'Informe uma categoria existente.'});
        }
    

        if (year && yearMatch && typeMatch) {
          const userfinancialYear = existFinancial.financialData.filter((t) => {
            if (new Date(t.date).getFullYear() === Number(year)) {
              return t;
            }
          });
    
          const typeExpenses = userfinancialYear.filter((t) => {
            if (t.typeOfExpenses === type) {
              return t;
            }
          });
        
          const typePrice = typeExpenses.map((t) => t.price);
          const priceSum = typePrice.reduce(
            (prevValue, currValue) => prevValue + currValue
          );
    
          return res.status(200).send({
            message: `O total  ${type} é $${priceSum} dollars`,
            data: typeExpenses,
          });
        }
        if (yearMatch) {
          const userfinancialYear = existFinancial.financialData.filter((t) => {
            if (new Date(t.date).getFullYear() === Number(year)) {
              return t;
            }
          });

          const amountArr = userfinancialYear.map((t) => t.price);
          const sumForYear = amountArr.reduce(
            (prevValue, currValue) => prevValue + currValue
          );
          return res.status(200).send({message: `O total do ${year} é $${sumForYear} dollars`, data: userfinancialYear,
          });
        }
    
        return res.status(200).send({
          success: true,
          message: `Até agora esse usuário gastou $${sumUser} dollars.`,
          data: existFinancial.financialData,
        });
      },

  async importXLSX(req, res) {

    const transactions = await getData("financial.json");
    const users = await getData("users.json");

     /* 
#swagger.tags = ['Finantials']
#swagger.summary = 'Endpoint para importar aquivos xlsx.'
#swagger.consumes = ['multipart/form-data']  
    #swagger.parameters['file'] = {
        in: 'formData',
        type: 'file',
        required: 'true',
        description: 'Upload your file here.'}
*/

    
    const existUser = users.find(
      (user) => user.userID === Number(req.params.userID)
    );

    
    if (!existUser) {
      return res
        .status(404)
        .send({ message: 'Esse usuário não existe' });
    }
    if (!req.file) {
      return res.status(404).send({
        success: false,
        message: 'Você precisa importar o arquivo xlsx',
      });
    }
    
    const excelFile =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const mimeType = req.file.mimetype;
    const rightType = excelFile === mimeType;

    
    if (!rightType) {
      return res.status(400).send({
        message: 'Importe o arquivo, por favor'
      });
    }

    const xlsxBuffer = req.file.buffer;

    const bufferToData = await xlsxPopulate.fromDataAsync(xlsxBuffer);
    const rows = bufferToData.sheet(0).usedRange().value();

    const firstRow = rows.shift();
    const keys = ["price", "typeOfExpenses", "date", "name"];

    const allKeys = firstRow.every((item, index) => {
      return keys[index] === item;
    });

    if (!allKeys || keys.length !== 4) {
      return res.status(400).send({
        message: 'Os valores devem estar nessa ordem correta: price, typeOfExpenses, date, name'
      });
    }

    const newData = rows.map((row) => {
      const result = row.map((cell, index) => {
        if (index === 2) {
          cell = getJsDateFromExcel(cell);
        }
        
        return {
          [firstRow[index]]: cell ? cell : "",
        };
      });
      
      return Object.assign({}, ...result);
    });
    
    if (transactions.length > 0) {
      let userTransactions = transactions.find(
        (t) => t.userID === existUser.userID
      );
      

      if (!userTransactions) {
        userTransactions = {
          id: transactions.length + 1,
          userID: existUser.userID,
          financialData: newData.map((item, index) => {
            return {
              entryID: index + 1,
              ...item,
            };
          }),
        };

       
        transactions.push(userTransactions);
        await createUpdateData("financial.json", transactions);
        

      } else {
        userTransactions.financialData = [
          ...userTransactions.financialData,
          ...newData.map((item, index) => {
            return {
              entryID: userTransactions.financialData.length + index + 1,
              ...item,
            };
          }),
        ];
        

        transactions[userTransactions.id - 1] = userTransactions;
        await UpdateData("financial.json", transactions);
      }
      return res.status(200).send({
        message: 'Transação Registrada.',
        data: transactions,
      });
    }
    
    if (transactions.length === 0) {
      userTransactions = {
        id: 1,
        userID: existUser.userID,
        financialData: [
          ...newData.map((item, index) => {
            return {
              entryID: index + 1,
              ...item,
            };
          }),
        ],
      };
    
      transactions.push(userTransactions);
      await UpdateData("financial.json", transactions);
    }

    return res.status(200).send({
      success: true,
      message: 'Transação Registrada',
      data: transactions,
    });
  },

  async deleteFinancial(req, res) {

    const transactions = await getData("financial.json");
    const users = await getData("users.json");

    /* 
    #swagger.tags = ['Finantials']
    #swagger.summary = 'Endpoint deletar uma trasação de um usuário específico .'
    */


    const { userID, entryID } = req.params;

    const existUser = users.find((user) => user.userID === Number(userID));
    if (!existUser) {
      return res
        .status(404)
        .send({ message: 'Usuário não encontrado' });
    }

    const transactionFound = transactions.find(
      (item) => item.userID === existUser.userID
    );
    
    if (!transactionFound) {
      return res.status(404).send({
        message: 'Não existe transação para esse usuário!',
      });
    }
    
    const positionToDelete = transactionFound.financialData.findIndex(
      (t) => t.entryID === Number(entryID)
    );

    
    transactionFound.financialData.splice(positionToDelete, 1);
4
    if (positionToDelete === -1) {
      return res
        .status(404)
        .send({ success: false, message: 'Essa transação não existe!' });
    }

    
    UpdateData("financial.json", transactions);

    return res.status(200).send({
      message: 'Transação deletada!',
      data: transactions,
    });
  },

};
