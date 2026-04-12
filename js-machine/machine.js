const SHEET_ID = '1-YqXgszRPBG0Xjc2GoHrpl0SLVjz9NRxR1k82vLLyig';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=data`;

let allMembers = [];

async function getData() {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    let html = "";
    let no = 1;

    json.table.rows.forEach((row, i) => {
        const uid = row.c[0]?.v;
        if (!uid) return;

        const member = {
            uid: uid,
            nama: row.c[1]?.v,
            jab: row.c[2]?.v,
            divs: row.c[3]?.v,
            thn: row.c[4]?.v,
            masa: row.c[5]?.v,
            stat: row.c[6]?.v || "Aktif",
            foto: row.c[7]?.v,
            jejak: row.c[8]?.v || "-"
        };

        allMembers.push(member);

        html += `
        <tr onclick="showProfile('${member.uid}')">
            <td>${no++}</td>
            <td>${member.uid}<br><small>${member.nama}</small></td>
            <td>${member.jab}</td>
            <td>${member.divs}</td>
            <td>${member.thn}</td>
            <td>${member.masa}</td>
            <td>${member.stat}</td>
            <td><button onclick="event.stopPropagation(); dl('${member.uid}','${member.nama}')">QR</button></td>
        </tr>`;
    });

    document.getElementById("memberData").innerHTML = html;
    document.getElementById("loading").style.display = "none";
    document.getElementById("mainTable").style.display = "table";
}

function showProfile(uid) {
    const m = allMembers.find(x => x.uid === uid);
    if (!m) return;

    document.getElementById("m-nama").innerText = m.nama;
    document.getElementById("m-uid").innerText = m.uid;
    document.getElementById("m-foto").src = m.foto;
}

function closeModal() {
    document.getElementById("profileModal").style.display = "none";
}

getData();