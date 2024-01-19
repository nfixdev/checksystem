const telegrambot = require('node-telegram-bot-api');
const token = '6802319674:AAG3mBMojhnyMZfMZ940IAqo2cnCm7w90bI';
const bot = new telegrambot(token, {polling: true});
const mysql2 = require("mysql2");
const path = require('path');
const express = require("express");
const app = express();

const { exec } = require("child_process");
const fs = require("fs");

const connection = mysql2.createConnection({
    host: "localhost",
    user: "root",
    database: "chatbottests",
    password: ''
});

connection.connect(function(err){
    if(err){
        return console.error("Ошибка: " + err.message);
    }
    else{
        console.log("Подключение к серверу установленно");
    }
});

connection.query('select id, name, description from check_system', (err, result)=>{
    if(err) console.log(err);
    else{
        let _json = JSON.stringify(result, undefined, 4);

        fs.writeFile('html/tasks.json', _json, (err)=>{
            if(err) console.log(err);
        });
    }
});

bot.onText(/\/start/, (msg)=>{
    bot.sendMessage(msg.chat.id, "");
});

let check_number = (str) => {
    return !Number.isNaN(parseInt(str));
};

function testing(bot, msg, task_id, filename){
    let test_pass = 0;
    let total_tests = 0;
    connection.query("select tests from check_system where id=?", [task_id], (err, results)=>{
        if(err){
            bot.sendMessage(msg.chat.id, "Произошла внутренняя ошибка!");
            console.log("SQL Error: " + err.message);
        }
        else{
            results = results.map(v => Object.assign({}, v));
            fs.writeFile('tests/tests.json', results[0]["tests"], (err)=>{if(err) console.log(err);});
            exec(`cmd /c chcp 65001>nul && check_system.exe ${filename} tests/tests.json`, { encoding: "cp65001" }, (err, stdout, stderr)=>{
                if(err) console.log(err);
                if(stdout) fs.writeFile('program_out.txt', stdout, (err)=>{if(err) console.log(err);});
                if(stderr) fs.writeFile('programm_errors.txt', stderr, (err)=>{if(err) console.log(err);});
            });
            fs.readFile('result.json', (err, data)=>{
                if(err) throw err;
                let obj = JSON.parse(data);
                bot.sendMessage(msg.chat.id, `Тестов успешно пройдено: ${obj.passed}/${obj.total}`);
            });
            
        }
    });
}

bot.on('message', (msg)=>{
    if(msg.document!=undefined){
        let file = bot.getFile(msg.document.file_id);
        file.then(result => {
            if(msg.caption!=undefined){
                bot.downloadFile(result.file_id, './documents/').then(result2 => {
                    testing(bot, msg, parseInt(msg.caption), result.file_path);
                }, error2 => {
                    console.log(`failed while get file: ${error2}`);
                });
            }
            else{
                bot.sendMessage(msg.chat.id, "Добавьте подпись с id задачи!");
            }
        }, 
        error => {
            console.log(`failed on upload file: ${error}`);
        });
    }
    else{
        bot.sendMessage(msg.chat.id, "Это не файл!");
    }
});

app.get("/", (_,response)=>{
    fs.readFile('html/index.html', (err, data)=>{
        if(err){
            response.send("Error while read index.html");
        }
        else{
            response.send(data.toString());
        }
    });
});
app.get("/tasks.json", function(_, response){
    const options = {
        root: path.join(__dirname)
    };
    response.sendFile('html/tasks.json', options);
});

app.listen(3000);