// DATA & STATE INITIALIZATION
let dataBarang = JSON.parse(localStorage.getItem('jo_shop_barang')) || [
    { kode: 'BRG001', nama: 'Kemeja josjis', kategori: 'Pakaian', stok: 15, satuan: 'Pcs', harga: 125000, lokasi: 'Rak A1' },
    { kode: 'BRG002', nama: 'Mouse Gaming RGB', kategori: 'Elektronik', stok: 4, satuan: 'Unit', harga: 175000, lokasi: 'Rak B2' },
    { kode: 'BRG003', nama: 'Keripik Singkong Balado', kategori: 'Makanan', stok: 30, satuan: 'Bungkus', harga: 12000, lokasi: 'Rak C1' },
    { kode: 'BRG004', nama: 'Flashdisk 32GB', kategori: 'Elektronik', stok: 2, satuan: 'Pcs', harga: 65000, lokasi: 'Rak B1' }
];

let dataRiwayat = JSON.parse(localStorage.getItem('jo_shop_riwayat')) || [
    { tanggal: '2026-10-01', kode: 'BRG001', nama: 'Kemeja Flanel Casual', jenis: 'Masuk', jumlah: 20, keterangan: 'Supplier Textile Jaya' },
    { tanggal: '2026-10-03', kode: 'BRG001', nama: 'Kemeja josjis', jenis: 'Keluar', jumlah: 5, keterangan: 'Toko Cabang Timur' },
    { tanggal: '2026-10-05', kode: 'BRG002', nama: 'Mouse Gaming RGB', jenis: 'Masuk', jumlah: 10, keterangan: 'Distributor Komputer Indo' },
    { tanggal: '2026-10-07', kode: 'BRG002', nama: 'Mouse Gaming RGB', jenis: 'Keluar', jumlah: 6, keterangan: 'Bapak Budi' }
];

// SAVE TO LOCALSTORAGE
function saveStorage() {
    localStorage.setItem('jo_shop_barang', JSON.stringify(dataBarang));
    localStorage.setItem('jo_shop_riwayat', JSON.stringify(dataRiwayat));
}

// NAVIGATION & DOM READY
document.addEventListener('DOMContentLoaded', () => {
    // Set default tanggal hari ini pada form transaksi
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('masuk-tanggal').value = todayStr;
    document.getElementById('keluar-tanggal').value = todayStr;

    initNavigation();
    renderAll();

    // Event listener tombol & form
    document.getElementById('sidebar-toggle').addEventListener('click', toggleMobileSidebar);
    document.getElementById('btn-tambah-barang').addEventListener('click', openAddModal);
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
    document.getElementById('form-barang').addEventListener('submit', handleSaveBarang);
    document.getElementById('form-barang-masuk').addEventListener('submit', handleBarangMasuk);
    document.getElementById('form-barang-keluar').addEventListener('submit', handleBarangKeluar);
    document.getElementById('search-barang').addEventListener('input', renderTabelBarang);
    document.getElementById('filter-kategori').addEventListener('change', renderTabelBarang);
    document.getElementById('search-riwayat').addEventListener('input', renderTabelRiwayat);
    document.getElementById('btn-cetak').addEventListener('click', () => window.print());
});

// NAVIGATION LOGIC
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            link.classList.add('active');

            const targetId = link.getAttribute('data-target');
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');

            // Tutup sidebar di mobile jika diklik
            document.querySelector('.sidebar').classList.remove('mobile-show');
        });
    });
}

function toggleMobileSidebar() {
    document.querySelector('.sidebar').classList.toggle('mobile-show');
}

// RENDER ALL DATA & DASHBOARD
function renderAll() {
    renderDashboard();
    renderTabelBarang();
    renderDropdownBarang();
    renderTabelRiwayat();
    renderLaporan();
}

function renderDashboard() {
    let totalJenis = dataBarang.length;
    let totalStok = dataBarang.reduce((sum, item) => sum + Number(item.stok), 0);
    
    let totalMasuk = dataRiwayat
        .filter(r => r.jenis === 'Masuk')
        .reduce((sum, r) => sum + Number(r.jumlah), 0);

    let totalKeluar = dataRiwayat
        .filter(r => r.jenis === 'Keluar')
        .reduce((sum, r) => sum + Number(r.jumlah), 0);

    document.getElementById('stat-total-jenis').innerText = totalJenis;
    document.getElementById('stat-total-stok').innerText = totalStok;
    document.getElementById('stat-total-masuk').innerText = totalMasuk;
    document.getElementById('stat-total-keluar').innerText = totalKeluar;

    // Render alert stok menipis (< 5)
    const alertList = document.getElementById('alert-stok-list');
    alertList.innerHTML = '';
    const lowStockItems = dataBarang.filter(item => item.stok < 5);

    const alertContainer = document.getElementById('alert-stok-container');
    if (lowStockItems.length > 0) {
        alertContainer.style.display = 'block';
        lowStockItems.forEach(item => {
            let li = document.createElement('li');
            li.innerHTML = `<strong>${item.nama}</strong> (${item.kode}) sisa stok: <strong>${item.stok} ${item.satuan}</strong>`;
            alertList.appendChild(li);
        });
    } else {
        alertContainer.style.display = 'none';
    }
}

// 1. DATA BARANG FUNCTIONS
function renderTabelBarang() {
    const tbody = document.getElementById('tabel-barang-body');
    tbody.innerHTML = '';

    const keyword = document.getElementById('search-barang').value.toLowerCase();
    const kategoriFilter = document.getElementById('filter-kategori').value;

    const filtered = dataBarang.filter(item => {
        const matchKeyword = item.nama.toLowerCase().includes(keyword) || item.kode.toLowerCase().includes(keyword);
        const matchKategori = kategoriFilter === '' || item.kategori === kategoriFilter;
        return matchKeyword && matchKategori;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Tidak ada data barang ditemukan.</td></tr>`;
        return;
    }

    filtered.forEach((item, index) => {
        // Cari index asli di array utama
        const originalIndex = dataBarang.findIndex(b => b.kode === item.kode);
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.kode}</strong></td>
            <td>${item.nama}</td>
            <td>${item.kategori}</td>
            <td><span style="font-weight: 600; color: ${item.stok < 5 ? 'var(--danger)' : 'inherit'}">${item.stok}</span></td>
            <td>${item.satuan}</td>
            <td>Rp ${Number(item.harga).toLocaleString('id-ID')}</td>
            <td>${item.lokasi}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditModal(${originalIndex})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="hapusBarang(${originalIndex})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddModal() {
    document.getElementById('modal-title').innerText = 'Tambah Barang Baru';
    document.getElementById('form-barang').reset();
    document.getElementById('edit-index').value = '';
    document.getElementById('barang-kode').disabled = false;
    document.getElementById('modal-barang').classList.add('active');
}

function openEditModal(index) {
    document.getElementById('modal-title').innerText = 'Edit Data Barang';
    const item = dataBarang[index];
    document.getElementById('edit-index').value = index;
    document.getElementById('barang-kode').value = item.kode;
    document.getElementById('barang-kode').disabled = true; // Kode unik tidak diubah
    document.getElementById('barang-nama').value = item.nama;
    document.getElementById('barang-kategori').value = item.kategori;
    document.getElementById('barang-stok').value = item.stok;
    document.getElementById('barang-satuan').value = item.satuan;
    document.getElementById('barang-harga').value = item.harga;
    document.getElementById('barang-lokasi').value = item.lokasi;
    document.getElementById('modal-barang').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-barang').classList.remove('active');
}

function handleSaveBarang(e) {
    e.preventDefault();
    const editIndex = document.getElementById('edit-index').value;
    const kode = document.getElementById('barang-kode').value.trim();
    const nama = document.getElementById('barang-nama').value.trim();
    const kategori = document.getElementById('barang-kategori').value;
    const stok = Number(document.getElementById('barang-stok').value);
    const satuan = document.getElementById('barang-satuan').value.trim();
    const harga = Number(document.getElementById('barang-harga').value);
    const lokasi = document.getElementById('barang-lokasi').value.trim();

    if (stok < 0 || harga < 0) {
        alert('Stok dan harga tidak boleh bernilai negatif!');
        return;
    }

    if (editIndex === '') {
        // Cek duplikasi kode
        const exists = dataBarang.some(b => b.kode === kode);
        if (exists) {
            alert('Kode barang sudah terdaftar! Gunakan kode lain.');
            return;
        }
        dataBarang.push({ kode, nama, kategori, stok, satuan, harga, lokasi });
    } else {
        dataBarang[editIndex].nama = nama;
        dataBarang[editIndex].kategori = kategori;
        dataBarang[editIndex].stok = stok;
        dataBarang[editIndex].satuan = satuan;
        dataBarang[editIndex].harga = harga;
        dataBarang[editIndex].lokasi = lokasi;
    }

    saveStorage();
    renderAll();
    closeModal();
}

function hapusBarang(index) {
    if (confirm(`Apakah Anda yakin ingin menghapus barang "${dataBarang[index].nama}"?`)) {
        dataBarang.splice(index, 1);
        saveStorage();
        renderAll();
    }
}

// 2. TRANSAKSI (MASUK & KELUAR)
function renderDropdownBarang() {
    const selectMasuk = document.getElementById('masuk-kode');
    const selectKeluar = document.getElementById('keluar-kode');
    
    let options = '<option value="">-- Pilih Barang --</option>';
    dataBarang.forEach(item => {
        options += `<option value="${item.kode}">${item.kode} - ${item.nama} (Stok: ${item.stok})</option>`;
    });

    selectMasuk.innerHTML = options;
    selectKeluar.innerHTML = options;
}

function handleBarangMasuk(e) {
    e.preventDefault();
    const kode = document.getElementById('masuk-kode').value;
    const jumlah = Number(document.getElementById('masuk-jumlah').value);
    const tanggal = document.getElementById('masuk-tanggal').value;
    const pemasok = document.getElementById('masuk-pemasok').value.trim();

    if (jumlah <= 0) {
        alert('Jumlah masuk harus lebih dari 0!');
        return;
    }

    const barang = dataBarang.find(b => b.kode === kode);
    if (!barang) return;

    barang.stok += jumlah;

    dataRiwayat.unshift({
        tanggal,
        kode: barang.kode,
        nama: barang.nama,
        jenis: 'Masuk',
        jumlah,
        keterangan: pemasok
    });

    saveStorage();
    renderAll();
    document.getElementById('form-barang-masuk').reset();
    document.getElementById('masuk-tanggal').value = new Date().toISOString().split('T')[0];
    alert('Barang masuk berhasil dicatat dan stok diperbarui!');
}

function handleBarangKeluar(e) {
    e.preventDefault();
    const kode = document.getElementById('keluar-kode').value;
    const jumlah = Number(document.getElementById('keluar-jumlah').value);
    const tanggal = document.getElementById('keluar-tanggal').value;
    const penerima = document.getElementById('keluar-penerima').value.trim();

    if (jumlah <= 0) {
        alert('Jumlah keluar harus lebih dari 0!');
        return;
    }

    const barang = dataBarang.find(b => b.kode === kode);
    if (!barang) return;

    if (barang.stok < jumlah) {
        alert(`Transaksi ditolak! Stok tidak mencukupi. Sisa stok saat ini: ${barang.stok} ${barang.satuan}`);
        return;
    }

    barang.stok -= jumlah;

    dataRiwayat.unshift({
        tanggal,
        kode: barang.kode,
        nama: barang.nama,
        jenis: 'Keluar',
        jumlah,
        keterangan: penerima
    });

    saveStorage();
    renderAll();
    document.getElementById('form-barang-keluar').reset();
    document.getElementById('keluar-tanggal').value = new Date().toISOString().split('T')[0];
    alert('Barang keluar berhasil dicatat dan stok dikurangi!');
}

// 3. RIWAYAT TRANSAKSI
function renderTabelRiwayat() {
    const tbody = document.getElementById('tabel-riwayat-body');
    tbody.innerHTML = '';

    const keyword = document.getElementById('search-riwayat').value.toLowerCase();
    const filtered = dataRiwayat.filter(r => 
        r.nama.toLowerCase().includes(keyword) || 
        r.kode.toLowerCase().includes(keyword) || 
        r.keterangan.toLowerCase().includes(keyword)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Belum ada riwayat transaksi.</td></tr>`;
        return;
    }

    filtered.forEach(r => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.tanggal}</td>
            <td><strong>${r.kode}</strong></td>
            <td>${r.nama}</td>
            <td><span class="btn btn-sm ${r.jenis === 'Masuk' ? 'btn-primary' : 'btn-warning'}" style="pointer-events: none;">${r.jenis}</span></td>
            <td>${r.jumlah}</td>
            <td>${r.keterangan}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 4. LAPORAN
function renderLaporan() {
    // Tanggal Cetak Laporan
    document.getElementById('print-date').innerText = `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`

    // Tabel Stok Laporan
    const stokBody = document.getElementById('laporan-stok-body');
    stokBody.innerHTML = '';
    dataBarang.forEach(item => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.kode}</td>
            <td>${item.nama}</td>
            <td>${item.kategori}</td>
            <td>${item.stok}</td>
            <td>${item.satuan}</td>
            <td>Rp ${Number(item.harga).toLocaleString('id-ID')}</td>
            <td>${item.lokasi}</td>
        `;
        stokBody.appendChild(tr);
    });

    // Tabel Riwayat Laporan
    const riwayatBody = document.getElementById('laporan-riwayat-body');
    riwayatBody.innerHTML = '';
    dataRiwayat.forEach(r => {
        let tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.tanggal}</td>
            <td>${r.kode}</td>
            <td>${r.nama}</td>
            <td>${r.jenis}</td>
            <td>${r.jumlah}</td>
            <td>${r.keterangan}</td>
        `;
        riwayatBody.appendChild(tr);
    });
}