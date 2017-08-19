const Inquirer = require("inquirer");
const CardConstructor = require("./CardConstructors.js");
const fs = require("fs");
var currentCard = {};



function initialMenu(){
    Inquirer.prompt([
        {
            type: "list",
            name: "activity",
            message: "What would you like to do?",
            choices: ["Create new cards", "Delete old cards", "Organize packs", "Practice with current cards"]
        }
    ]).then(function(inqResp){
        var activity = inqResp.activity;

        if (activity === "Create new cards"){
            createMenu();
        } else if (activity === "Delete old cards"){
            deleteMenu();
        } else if (activity === "Organize packs"){
            packsMenu();
        } else if (activity === "Practice with current cards"){
            practiceMenu();
        }
    });
}

function createMenu(){
    Inquirer.prompt([
        {
            type: "list",
            name: "cardType",
            message: "Would you like to create flash cards or cloze cards?",
            choices: ["Flash Cards", "Cloze Cards", "Return to main menu"]
        }
    ]).then(function(inqResp){
        var cardType = inqResp.cardType;

        if (cardType === "Flash Cards"){
            createFlash();
        } else if (cardType === "Cloze Cards"){
            createCloze();
        } else if (cardType === "Return to main menu"){
            initialMenu();
        }
    });
}

function deleteMenu(){
    Inquirer.prompt([
        {
            type: "list",
            name: "deleteChoice",
            message: "Would you like to delete individual cards or full packs",
            choices: ["Packs", "Individual Cards", "Main Menu"]
        }
    ]).then(function(inqResp){
        var deleteChoice = inqResp.deleteChoice;

        if (deleteChoice === "Main Menu"){
            initialMenu();
        } else if (deleteChoice === "Packs"){
            deletePacks();
        } else if (deleteChoice === "Individual Cards"){
            deleteCards();
        }
    });
}

function packsMenu(){
    Inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do with the card packs?",
            choices: ["Create new packs", "Delete current packs",  "Add cards to a pack", "Remove cards from a pack"],
            name: "packActivity"
        }
    ]).then(function(inqResp){
        if (inqResp.packActivity === "Create new packs"){
            createPacks();
        } else if (inqResp.packActivity === "Delete current packs"){
            deletePacks();
        } else if (inqResp.packActivity === "Add cards to a pack"){
            addToPacks();
        } else if (inqResp.packActivity === "Remove cards from a pack"){
            removeFromPacks();
        }
    });

}

function practiceMenu(){

}

function createFlash(){
    var front;
    var back;
    var packs;

    Inquirer.prompt([
        {
            type: "input",
            name: "front",
            message: "Enter the question or definition - Front of the card"
        },
        {
            type: "input",
            name: "back",
            message: "Enter the answer to your question - The back of the card"
        },
        {
            type: "checkbox",
            name: "packs",
            message: "Which packs would you like to add this card to?",
            choices: function(){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = cards.packs;
                choices.push("None");
                return choices;
            }
        }
    ]).then(function(inqResp){
        var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
        if (inqResp.packs.includes("None")){
            packs = "";
        } else {
            packs = inqResp.packs;
        }
        front = inqResp.front;
        back = inqResp.back;
        CardConstructor.BasicCard(front, back, packs);
    });
}

function createCloze(){
    var text;
    var deletion;
    var packs;

    Inquirer.prompt([
        {
            type: "input",
            message: "Please enter the full text of the card. You don't need to create the blank space yet!",
            name: "fullText"
        }
    ]).then(function(inqResp){
        text = inqResp.fullText
        var textArr = inqResp.fullText.split(" ");
        Inquirer.prompt([
            {
                type: "checkbox",
                message: "Select all the words you want to delete. Don't select them all!",
                name: "deleteSelection",
                choices: textArr
            },
            {
            type: "checkbox",
            name: "packs",
            message: "Which packs would you like to add this card to?",
            choices: function(){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = cards.packs;
                 choices.push("None")
                return choices;
            }
        }
        ]).then(function(inqResp){
            var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
            deletion = inqResp.deleteSelection;
            if (inqResp.packs.includes("None")){
                packs = "";
            } else {
                packs = inqResp.packs;
            }
            CardConstructor.ClozeCard(text, deletion, packs);
            });
        });
}

function createPacks(){
     Inquirer.prompt([
                {
                    type: "input",
                    message: "Enter the name of your new pack",
                    name: "newPack"
                },
                {
                    type: "confirm",
                    message: "Would you like to add any other packs?",
                    name: "morePacks"
                }
            ]).then(function(inqResp){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                cards.packs.push(inqResp.newPack);
                fs.writeFileSync("cards.json", JSON.stringify(cards), "utf8");  
                if (inqResp.morePacks){
                    createPacks();
                } else {
                    initialMenu();
                }
            });
}

function deletePacks(){
     Inquirer.prompt([
        {
            type: "list",
            name: "packsToDelete",
            message: "Which packs would you like to remove?",
            choices: function (){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = cards.packs;
                return choices;
            }
        },
        {
            type: "confirm",
            message: "Would you like to delete all associated cards as well?",
            name: "confirmDeleteCards"
        }
    ]).then(function(inqResp){
        var packsToDelete = inqResp.packsToDelete;
        var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
        var flash = cards.cards.flash;
        var cloze = cards.cards.cloze;

        if (inqResp.confirmDeleteCards){
            for (var i = flash.length; i >= 0; i--) {
                var element = flash[i];
                element.packs.forEach(function(packElement) {
                    if (packsToDelete.indexOf(packElement) !== -1){
                        flash.slice(flash[i] , 1);
                    }
                });
            }
            for (var i = cloze.length; i >= 0; i--) {
                var element = cloze[i];
                element.packs.forEach(function(packElement) {
                    if (packsToDelete.indexOf(packElement) !== -1){
                        cloze.slice(cloze[i] , 1);
                    }
                });
            }
        } else { 
            for (var i = flash.length; i >= 0; i--) {
                var element = flash[i];
                element.packs.forEach(function(packElement) {
                    if (packsToDelete.indexOf(packElement) !== -1){
                        element.packs.slice(element.packs.indexOf(packElement) , 1);
                    }
                });
            }
            for (var i = cloze.length; i >= 0; i--) {
                var element = cloze[i];
                element.packs.forEach(function(packElement) {
                    if (packsToDelete.indexOf(packElement) !== -1){
                        cloze.slice(cloze[i] , 1);
                    }
                });
            }    
        }
        fs.writeFileSync("cards.json", JSON.stringify(cards), "utf8");
    });
}

function addToPacks(){
    Inquirer.prompt([
        {
            type: "list",
            message: "Which pack would you like to add to?",
            name: "packForAdding",
            choices: function (){
                var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                var choices = cards.packs;
                choices.push("Main Menu");
                return choices;
            }
        }
    ]).then(function(inqResp){
        if (inqResp.packForAdding === "Main Menu") {
            initialMenu();
        } 
        var packForAdding = inqResp.packForAdding;
        Inquirer.prompt([
            {
                type: "checkbox",
                message: `Please select all cards you would like to add to the pack '${packForAdding}`,
                name: "cardsAdded",
                choices: function(){
                    var cards = JSON.parse(fs.readFileSync("cards.json", "utf8"));
                    var choices = cards.cards.flash;
                    choices.push(cards.cards.cloze);
                    return choices;
                }
            }
        ]).then(function(inqResp){
            inqResp.cardsAdded.forEach(function (element){
                element.packs.push(packForAdding);
            });
            Inquirer.prompt([
                {
                    type: "confirm",
                    message: "Would you like to add to another pack?",
                    name: "addToMore"
                }
            ]).then(function(inqResp){
                if (inqResp.addToMore) {
                    addToPacks();
                } else {
                    initialMenu();
                }
            });

        });
    });
}

function removeFromPacks(){

}

function deleteCards(){

}

initialMenu();