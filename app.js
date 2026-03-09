import React, { useState } from 'react';
import './App.css';
import { FaPlus, FaUser, FaBoxOpen } from 'react-icons/fa';

// Import de l'image
import fond from './assets/ma-fond.jpg';  // <-- ici

function App() {}
// App.js (vanilla JS version)

const calendar = document.getElementById("calendar");
const monthSelector = document.getElementById("monthSelector");
const requestsTable = document.getElementById("requestsTable");
const shiftType = document.getElementById("shiftType");

let agentName = prompt("Nom de l'agent") || "Agent";
let requests = [];
let firstClick = null;
let firstDayNum = null;

const months = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const days=["L","M","M","J","V","S","D"];

// Ajout des options du select mois
months.forEach((m,i)=>{
    let opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m;
    monthSelector.appendChild(opt);
});

// padding pour format YYYY-MM-DD
function pad(n){ return n.toString().padStart(2,"0"); }

// Met à jour la table des demandes
function updateTable(){
    requestsTable.innerHTML="";
    requests.forEach((r,index)=>{
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${r.agent}</td>
            <td>${formatDate(r.day)}</td>
            <td>${r.type}</td>
            <td>${formatDate(r.exchange)}</td>
            <td>${r.accepted ? agentName : ""}</td>  <!-- Affiche l’agent qui a accepté -->
            <td></td>
        `;
        let actionCell = tr.children[5]; // Action maintenant en 6ᵉ colonne

        if(!r.accepted && r.agent !== agentName){
            let btn = document.createElement("button");
            btn.textContent="Accepter";
            btn.className="acceptBtn";
            btn.onclick = () => {
                r.accepted = true;
                updateTable();
            };
            actionCell.appendChild(btn);
        }

        if(r.agent === agentName){
            let btn = document.createElement("button");
            btn.textContent="Annuler";
            btn.className="cancelBtn";
            btn.onclick = () => {
                requests.splice(index,1);
                updateTable();
            };
            actionCell.appendChild(btn);
        }

        requestsTable.appendChild(tr);
    });

    paintCalendar();
}


// Coloration du calendrier
function paintCalendar() {
    const currentMonth = parseInt(monthSelector.value);
    const year = 2026;

    document.querySelectorAll(".day").forEach(day => {
        const num = parseInt(day.dataset.day);
        day.classList.remove("jour","nuit","garde24","accepted");
        day.innerHTML = `<div>${num}</div>`;

        requests.forEach(r => {
            const reqDate = new Date(r.day);
            const exchDate = new Date(r.exchange);

            // Vérifie si la demande ou l'échange appartient au mois affiché
            if(reqDate.getMonth() !== currentMonth && exchDate.getMonth() !== currentMonth) return;

            let typeText = "";
            if(r.type === "12h-jour") typeText = "J";
            if(r.type === "12h-nuit") typeText = "N";
            if(r.type === "24h") typeText = "24h";

            // demande initiale
            if(reqDate.getDate() === num && reqDate.getMonth() === currentMonth){
                if(r.type === "12h-jour") day.classList.add("jour");
                if(r.type === "12h-nuit") day.classList.add("nuit");
                if(r.type === "24h") day.classList.add("garde24");
                day.innerHTML = `<div>${num}</div><div style="font-size:10px">${typeText}</div>`;
            }

            // demande acceptée
            if(r.accepted && exchDate.getDate() === num && exchDate.getMonth() === currentMonth){
                day.classList.add("accepted");
                day.innerHTML = `<div>${num}</div><div style="font-size:10px">${typeText}</div>`;
            }
        });
    });
}
// Génération du calendrier
function generateCalendar(month){
    calendar.innerHTML="";
    const year = 2026;

    // entêtes jours
    days.forEach(d=>{
        let el = document.createElement("div");
        el.textContent=d;
        el.className="dayHeader";
        calendar.appendChild(el);
    });

    const firstDay = new Date(year,month,1).getDay();
    const offset = (firstDay+6)%7;
    for(let i=0;i<offset;i++){ calendar.appendChild(document.createElement("div")); }

    const daysInMonth = new Date(year,month+1,0).getDate();

    for(let d=1;d<=daysInMonth;d++){
        let day = document.createElement("div");
        day.className="day";
        day.textContent=d;
        day.dataset.day=d;

        day.onclick = () => {
            if(!firstClick){
                firstClick = `${year}-${pad(month+1)}-${pad(d)}`;
                firstDayNum = d;
                paintCalendar(); // montre la demande immédiatement
                return;
            }

            if(Math.abs(d-firstDayNum)!==1){
                alert("Seulement jour avant ou après");
                return;
            }

            requests.push({
                agent: agentName,
                day: firstClick,
                type: shiftType.value,
                exchange: `${year}-${pad(month+1)}-${pad(d)}`,
                accepted:false
            });

            firstClick = null;
            paintCalendar();
            updateTable();
        };

        calendar.appendChild(day);
    }

    paintCalendar();
}

// Initialisation
const currentMonth = new Date().getMonth();
monthSelector.value = currentMonth;
generateCalendar(currentMonth);

monthSelector.onchange = () => generateCalendar(parseInt(monthSelector.value));
