const SHEET_ID = '1-YqXgszRPBG0Xjc2GoHrpl0SLVjz9NRxR1k82vLLyig';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=data`;
const currentUrl = window.location.origin + window.location.pathname;

let allMembers = [];

// CEK URL
function checkUrlImmediately() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('i');
    const view = urlParams.get('p');

    document.getElementById('scanMenu').style.display = 'none';
    document.getElementById('profileModal').style.display = 'none';

    if (id && view === '1') {
        document.getElementById('scanMenu').style.setProperty('display', 'flex', 'important');
    }
}

async function getData() {
    try {
        const res = await fetch(url);
        const text = await res.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        let html = '';
        let noUrut = 1;

        rows.forEach((row) => {
            const uid = row.c[0] ? String(row.c[0].v).trim() : '';
            if (!uid || uid.toLowerCase().includes('nomor')) return;

            const member = {
                uid: uid,
                nama: row.c[1] ? row.c[1].v : '-',
                jab: row.c[2] ? row.c[2].v : '-',
                divs: row.c[3] ? row.c[3].v : '-',
                thn: row.c[4] ? row.c[4].v : '-',
                masa: row.c[5] ? row.c[5].v : '-',
                stat: row.c[6] ? row.c[6].v : 'Aktif',
                foto: row.c[7]
                    ? convertDriveLink(row.c[7].v)
                    : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                jejak: row.c[8]
                    ? row.c[8].v
                    : 'Belum ada jenjang karier.',
                shortId: row.c[9]
                    ? String(row.c[9].v).padStart(3, '0')
                    : uid
            };

            allMembers.push(member);

            html += `
            <tr onclick="showProfile('${member.uid}')">
                <td style="color:#999;">${noUrut++}</td>
                <td>${member.uid}<br><small style="color:#777; font-weight:normal;">${member.nama}</small></td>
                <td>${member.jab}</td>
                <td>${member.divs}</td>
                <td>${member.thn}</td>
                <td>${member.masa}</td>
                <td>
                    <span class="status-tag ${member.stat.toLowerCase().includes('aktif') ? 'status-aktif' : 'status-alumni'}">
                        ${member.stat}
                    </span>
                </td>
                <td>
                    <button class="btn-download"
                        onclick="event.stopPropagation(); dl('${member.uid}', '${member.nama}')">
                        Unduh Kode QR
                    </button>
                </td>
            </tr>`;
        });

        document.getElementById('memberData').innerHTML = html;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mainTable').style.display = 'table';

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('i');
        const view = urlParams.get('p');

        if (id && view !== '1') {
            showProfile(id);
        }

    } catch (e) {
        console.error(e);
        document.getElementById('loading').innerText = 'Gagal memuat data.';
    }
}

function showProfile(uid) {
    const m = allMembers.find(
        x => x.uid === uid || x.shortId === uid
    );

    if (!m) return;

    document.getElementById('m-nama').innerText = m.nama;
    document.getElementById('m-uid').innerText = 'UID: ' + m.uid;

    const img = document.getElementById('m-foto');
    img.src = m.foto;

    img.onerror = () => {
        img.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    };

    document.getElementById('m-jab').innerText = m.jab;
    document.getElementById('m-divs').innerText = m.divs;
    document.getElementById('m-thn').innerText = m.thn;
    document.getElementById('m-masa').innerText = m.masa;
    document.getElementById('m-stat').innerText = m.stat;
    document.getElementById('m-jejak').innerHTML = m.jejak.replace(/\n/g, '<br>');

    document.getElementById('profileModal').style.display = 'block';
    document.getElementById('scanMenu').style.display = 'none';
}

function closeModal() {
    document.getElementById('profileModal').style.display = 'none';
}

function tutupMenu() {
    document.getElementById('scanMenu').style.display = 'none';
}

function bukaValidasi() {
    const id = new URLSearchParams(window.location.search).get('i');
    if (id) showProfile(id);
}

function dl(uid, name) {
    const tempDiv = document.createElement('div');
    const member = allMembers.find(x => x.uid === uid);

    if (!member) return;

    new QRCode(tempDiv, {
        text: `${currentUrl}?p=1&i=${member.shortId}`,
        width: 500,
        height: 500,
        colorDark: '#132c47',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });

    setTimeout(() => {
        const canvas = tempDiv.querySelector('canvas');

        if (canvas) {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `QR_ILAIKUM_${name}_${uid}.png`;
            link.click();
        }

        tempDiv.remove();
    }, 150);
}

document.getElementById('searchInput').oninput = (e) => {
    const val = e.target.value.toLowerCase();

    document.querySelectorAll('#memberData tr').forEach(tr => {
        tr.style.display = tr.innerText.toLowerCase().includes(val) ? '' : 'none';
    });
};

window.onclick = (e) => {
    if (e.target === document.getElementById('profileModal')) {
        closeModal();
    }
};

function bukaGmail(uid) {
    const tujuan = 'magazineilaikum@gmail.com';
    const idAnggota = uid || '[Isi UID Anda]';

    const subjek = encodeURIComponent(
        'LAPOR MASALAH KARTU ANGGOTA - ' + idAnggota
    );

    const isi = encodeURIComponent(`Halo Admin Ilaikum,

Saya ingin melaporkan permasalahan seputar kartu pers dengan UID ${idAnggota}.

(Tulis pesan anda di sini):
`);

    const urlGmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${tujuan}&su=${subjek}&body=${isi}`;

    const win = window.open(urlGmail, '_blank');

    setTimeout(() => {
        if (!win || win.closed) {
            window.location.href = `mailto:${tujuan}?subject=${subjek}&body=${isi}`;
        }
    }, 500);
}

function convertDriveLink(url) {
    if (!url) return '';
    if (!url.includes('drive.google.com')) return url;

    let fileId = '';

    let match = url.match(/\/d\/(.*?)\//);
    if (match && match[1]) fileId = match[1];

    if (!fileId) {
        match = url.match(/id=(.*?)(?:&|$)/);
        if (match && match[1]) fileId = match[1];
    }

    if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    return url;
}

checkUrlImmediately();
getData();