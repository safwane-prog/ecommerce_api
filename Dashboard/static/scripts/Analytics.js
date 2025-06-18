document.addEventListener('DOMContentLoaded', function() {
    // Initialize all charts
    initRevenueTrendChart();
    initOrdersTrendChart();
    initConversionTrendChart();
    initAovTrendChart();
    initRevenueChart();
    initTrafficChart();
    initProductsChart();
    initCustomersChart();
    initDevicesChart();
    
    // Date range picker functionality
    const dateRangePicker = document.querySelector('.date-range-picker');
    if (dateRangePicker) {
        dateRangePicker.addEventListener('click', function() {
            // In a real app, this would open a date picker UI
            alert('Date range picker would open here');
        });
    }
});

function initRevenueTrendChart() {
    const ctx = document.getElementById('revenueTrend').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', ''],
            datasets: [{
                data: [30, 40, 30, 50, 40, 60, 50],
                borderColor: '#6c5ce7',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
}

function initOrdersTrendChart() {
    const ctx = document.getElementById('ordersTrend').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', ''],
            datasets: [{
                data: [20, 30, 25, 35, 30, 40, 35],
                borderColor: '#00b894',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
}

function initConversionTrendChart() {
    const ctx = document.getElementById('conversionTrend').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', ''],
            datasets: [{
                data: [3.5, 3.2, 3.0, 3.1, 3.0, 3.2, 3.1],
                borderColor: '#e74c3c',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
}

function initAovTrendChart() {
    const ctx = document.getElementById('aovTrend').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', ''],
            datasets: [{
                data: [85, 82, 84, 86, 87, 89, 88],
                borderColor: '#0984e3',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });
}

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Revenue',
                data: [3500, 4200, 3800, 5100, 4900, 6200, 5800],
                backgroundColor: '#6c5ce7',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initTrafficChart() {
    const ctx = document.getElementById('trafficChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Organic', 'Direct', 'Social', 'Email', 'Referral'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#6c5ce7',
                    '#00b894',
                    '#0984e3',
                    '#fdcb6e',
                    '#e74c3c'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function initProductsChart() {
    const ctx = document.getElementById('productsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Headphones', 'Smart Watch', 'Speaker', 'Laptop', 'Phone'],
            datasets: [{
                label: 'Revenue',
                data: [4250, 3780, 2950, 2100, 1850],
                backgroundColor: '#6c5ce7',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initCustomersChart() {
    const ctx = document.getElementById('customersChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'New Customers',
                data: [120, 150, 130, 170, 160, 190, 180],
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108, 92, 231, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initDevicesChart() {
    const ctx = document.getElementById('devicesChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Mobile', 'Desktop', 'Tablet'],
            datasets: [{
                data: [55, 40, 5],
                backgroundColor: [
                    '#6c5ce7',
                    '#00b894',
                    '#0984e3'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}