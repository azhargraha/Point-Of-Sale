const tabs = document.querySelectorAll('[data-tab-target]');
const tabsContent = document.querySelectorAll('[data-tab-content]');
const emptyOrder = document.getElementById('empty-order');
const menuItems = document.querySelectorAll(".menu-selection");

function commaSeperatedFormat(amount) {
    return amount.toLocaleString('id');
}
function intPrice(price) {
    return parseInt(price.match(/\d/g).join(''));
}

function createOrderList(productName, productPrice) {
    const orderListContainer = document.getElementById('order-list-container');
    const orderDetailContainer = document.createElement('li');
    orderDetailContainer.classList.add('order-detail-container');

    const orderContainer = document.createElement('div');
    orderContainer.classList.add('order-container');
    orderContainer.classList.add('flex-row');
    orderDetailContainer.appendChild(orderContainer);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    const deleteIcon = document.createElement('img');
    deleteIcon.src = '/icons/deleteIcon.svg';
    deleteBtn.appendChild(deleteIcon);
    orderContainer.appendChild(deleteBtn);
    const orderName = document.createElement('h3');
    orderName.classList.add('order-name');
    orderName.innerHTML = productName;
    orderContainer.appendChild(orderName);
    
    let quantity = 1;
    const qtyContainer = document.createElement('div');
    qtyContainer.classList.add('qty-container');
    qtyContainer.classList.add('flex-row');
    orderContainer.appendChild(qtyContainer);
    const subtractBtn = document.createElement('button');
    subtractBtn.classList.add('subtract-btn');
    subtractBtn.innerHTML = '-';
    qtyContainer.appendChild(subtractBtn);
    const qtyOrder = document.createElement('h3');
    qtyOrder.classList.add('qty-order');
    qtyOrder.innerHTML = 1;
    qtyContainer.appendChild(qtyOrder);
    const addBtn = document.createElement('button');
    addBtn.classList.add('add-btn');
    addBtn.innerHTML = '+';
    qtyContainer.appendChild(addBtn);
    
    const priceContainer = document.createElement('div');
    priceContainer.classList.add('price-container');
    priceContainer.classList.add('flex-row');
    orderDetailContainer.appendChild(priceContainer);
    
    const orderPrice = document.createElement('h4');
    orderPrice.classList.add('order-price');
    orderPrice.innerHTML = `Rp ${commaSeperatedFormat(productPrice)}`;
    priceContainer.appendChild(orderPrice);
    const priceTemp = intPrice(orderPrice.textContent);

    orderListContainer.appendChild(orderDetailContainer);

    addBtn.onclick = () => {
        quantity++;
        qtyOrder.innerHTML = quantity;
        updateTotalPerOrder(orderPrice, priceTemp, quantity);
        updateTotalPrice();
    };

    subtractBtn.onclick = () => {
        if(quantity==1) {
            return;
        } else {
            quantity--;
            qtyOrder.innerHTML = quantity;
            updateTotalPerOrder(orderPrice, -priceTemp, quantity);
            updateTotalPrice();
        }
    };

    deleteBtn.onclick = () => {
        removeOrderItem(orderName.textContent);
        orderIsEmpty();
    };
}

new Cleave('.form-uang-tunai', {
    numeral: true,
    numeralThousandGroupStyle: 'thousand',
    numeralDecimalMark: ',',
    delimiter: '.'
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = document.querySelector(tab.dataset.tabTarget);
        tabsContent.forEach(tabContent => {
            tabContent.classList.remove('active');
        })
        target.classList.add('active');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        })
        tab.classList.add('active');
    })
});

function removeOrderItem(itemName) {
    const itemRemove = document.querySelectorAll('.order-detail-container');
    itemRemove.forEach(item => {
        const menuName = item.querySelector('.order-name').textContent;
        if(menuName == itemName) {
            item.remove();
        }
    });
    menuItems.forEach(menuItem => {
        const selectionName = menuItem.querySelector('h1').textContent
        if(selectionName == itemName) {
            menuItem.classList.remove('active');
        }
    });
    updateTotalPrice();
}

function orderIsEmpty() {
    const orderListContainer = document.getElementById('order-list-container');
    const childElement = orderListContainer.childElementCount;
    if(childElement == 1) {
        emptyOrder.classList.remove('hidden');
    }
}

menuItems.forEach(menuItem => {
    const menuName = menuItem.querySelector('h1').textContent;
    const menuPrice = menuItem.querySelector('h3').textContent;
    menuItem.addEventListener('click', () => {
        menuItem.classList.toggle('active');
        if(!menuItem.classList.contains('active')){
            removeOrderItem(menuName);
            orderIsEmpty();
        } else {
            emptyOrder.classList.add('hidden');
            createOrderList(menuName, intPrice(menuPrice));
            updateTotalPrice();
        };
    })
});

function updateTotalPerOrder(currentPrice, pricePerItem, qty) {
    currentPrice.textContent = `Rp ${commaSeperatedFormat(intPrice(currentPrice.textContent) + pricePerItem)}`;
} 

function updateTotalPrice() {
    const orderListContainer = document.getElementById('order-list-container');
    const totalHarga = document.getElementById('total-harga');
    var jmlTotal = 0;   
    const priceItems = orderListContainer.querySelectorAll('.order-price');
    priceItems.forEach(priceItem => {
        jmlTotal += intPrice(priceItem.textContent);
    })
    totalHarga.textContent = `Rp ${commaSeperatedFormat(jmlTotal)}`;
    updateChangeAmount();
}

function updateChangeAmount() {
    const totalHarga = document.getElementById('total-harga').textContent;
    const uangTunai = document.querySelector('.form-uang-tunai').value;
    const kembalian = document.getElementById('jml-kembalian');
    
    if(uangTunai.match(/^0|^$|^-/g)) {
        document.querySelector('.form-uang-tunai').value = '';
        kembalian.textContent = `Rp 0`;
    } else {
        const jumlahKembalian = intPrice(uangTunai) - intPrice(totalHarga);
        if(jumlahKembalian < 0) {
            kembalian.textContent = `Tunai tidak mencukupi`;
        } else {
            kembalian.textContent = `Rp ${commaSeperatedFormat(jumlahKembalian)}`;
        }
    }
};

function removeAllOrder() {
    const itemRemove = document.querySelectorAll('.order-detail-container');
    itemRemove.forEach(item => {
        const menuName = item.querySelector('.order-name').textContent;
        removeOrderItem(menuName);
    });
    orderIsEmpty();
    document.querySelector('.form-uang-tunai').value = '';
    updateChangeAmount();
}

function payBtn() {
    const totalHarga = intPrice(document.getElementById('total-harga').textContent);
    const orderListContainer = document.getElementById('order-list-container');
    const childElement = orderListContainer.childElementCount;
    const uangTunai = document.querySelector('.form-uang-tunai').value;
    const kembalian = document.getElementById('jml-kembalian').textContent;

    var tanggal = new Date().toISOString().slice(0, 10);

    var jam = new Date().toString().slice(16,24);
  
    if(childElement == 1 || uangTunai == '' || kembalian == 'Tunai tidak mencukupi') {
        return;
    } else {
        let transactionLog = {
            tanggal,
            jam,
            uangTunai: intPrice(uangTunai),
            kembalian: intPrice(kembalian),
            totalHarga
        };
        let exportLog = JSON.stringify(transactionLog);
        fetch('http://localhost:3000/', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: exportLog
        });

        removeAllOrder();
    }
}
