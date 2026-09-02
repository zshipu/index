document.getElementById('toggleAttrition').addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('show-attrition');
    } else {
        document.body.classList.remove('show-attrition');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    renderAttritionTrend();
    renderDemographics();
    renderEducation();
    renderSurveyScore();
    renderRecentAttrition();
});

function renderAttritionTrend() {
    var ctx = document.getElementById('attritionTrendChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['May 2021', 'Jul 2021', 'Sep 2021', 'Nov 2021', 'Jan 2022', 'Mar 2022', 'May 2022'],
            datasets: [{
                label: 'Attrition',
                data: [5, 10, 15, 20, 25, 30, 60],
                backgroundColor: 'rgba(255, 127, 80, 0.7)',
                borderColor: 'rgba(255, 127, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderDemographics() {
    var genderCtx = document.getElementById('genderChart').getContext('2d');
    new Chart(genderCtx, {
        type: 'doughnut',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                label: 'Gender',
                data: [150, 87],
                backgroundColor: ['#ff7f50', '#f4f4f4']
            }]
        }
    });

    var ageCtx = document.getElementById('ageGroupChart').getContext('2d');
    new Chart(ageCtx, {
        type: 'bar',
        data: {
            labels: ['< 25', '25-34', '35-44', '45-55', '> 55'],
            datasets: [{
                label: 'Age Group',
                data: [59, 442, 454, 239, 39],
                backgroundColor: 'rgba(255, 127, 80, 0.7)',
                borderColor: 'rgba(255, 127, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderEducation() {
    var ctx = document.getElementById('educationChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Bachelor\'s Degree', 'Master\'s Degree', 'Associate Degree', 'High School', 'Doctoral Degree'],
            datasets: [{
                label: 'Education',
                data: [99, 58, 44, 31, 5],
                backgroundColor: 'rgba(255, 127, 80, 0.7)',
                borderColor: 'rgba(255, 127, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderSurveyScore() {
    var ctx = document.getElementById('surveyScoreChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Environment Satisfaction', 'Job Satisfaction', 'Job Involvement', 'Relationship Satisfaction', 'Work Life Balance'],
            datasets: [{
                label: 'Score 1',
                data: [72, 66, 28, 57, 25],
                backgroundColor: 'rgba(255, 127, 80, 0.7)'
            }, {
                label: 'Score 2',
                data: [43, 40, 71, 45, 58],
                backgroundColor: 'rgba(255, 127, 80, 0.5)'
            }, {
                label: 'Score 3',
                data: [62, 73, 125, 71, 82],
                backgroundColor: 'rgba(255, 127, 80, 0.3)'
            }, {
                label: 'Score 4',
                data: [60, 52, 131, 64, 126],
                backgroundColor: 'rgba(255, 127, 80, 0.1)'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderRecentAttrition() {
    // Optionally add interactivity for the recent attrition section
}
