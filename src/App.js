import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const App = () => {
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        date: '',
        category_id: ''
    });

    const [filteredIncome, setFilteredIncome] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [selectedMonth]);

    const fetchData = async () => {
        try {
            const incomeResponse = await axios.get('http://localhost:8000/api/incomes');
            const expenseResponse = await axios.get('http://localhost:8000/api/expenses');

            const totalIncome = incomeResponse.data.reduce((sum, income) => sum + Number(income.amount), 0);
            setTotalIncome(totalIncome);

            const totalExpense = expenseResponse.data.reduce((sum, expense) => sum + Number(expense.amount), 0);
            setTotalExpense(totalExpense);

            setCurrentBalance(totalIncome - totalExpense);
            setDataLoaded(true);

            if (selectedMonth) {
                filterDataByMonth(incomeResponse.data, expenseResponse.data, selectedMonth);
            }
        } catch (error) {
            console.error('Errore nel recupero dei dati:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Errore nel recupero delle categorie:', error);
        }
    };

    const filterDataByMonth = (incomes, expenses, month) => {
        const filteredIncome = incomes.filter(income => 
            new Date(income.date).toISOString().slice(0, 7) === month
        );
        setFilteredIncome(filteredIncome);

        const filteredExpenses = expenses.filter(expense => 
            new Date(expense.date).toISOString().slice(0, 7) === month
        );
        setFilteredExpenses(filteredExpenses);
    };

    const addExpense = async (event) => {
        event.preventDefault();

        try {
            if (newExpense.category_id === '1') {
                await axios.post('http://localhost:8000/api/incomes', {
                description: newExpense.description,
                amount: newExpense.amount,
                date: newExpense.date
                });
            } else {
                await axios.post('http://localhost:8000/api/expenses', newExpense);
            }
            console.log('Spesa/Entrata aggiunta con successo');
            updateData();
            window.location.href = 'http://localhost:3000/';
        } catch (error) {
            console.error('Errore nell\'aggiunta della spesa/entrata:', error);
            if (error.response) {
                console.error('Dettagli dell\'errore:', error.response.data);
            }
        }
    };

    const updateData = () => {
        setNewExpense({
            description: '',
            amount: '',
            date: '',
            category_id: ''
        });
        fetchData();
    };

    const formatNumber = (value) => {
        if (typeof value === 'number' && !isNaN(value)) {
            return value.toFixed(2);
        }
        return '0.00';
    };

    const handleMonthChange = (event) => {
        const selectedMonth = event.target.value;
        setSelectedMonth(selectedMonth);
    };

    const calculateTotalsByCategory = (expenses) => {
        const totals = {};
        expenses.forEach(expense => {
            const category = categories.find(cat => cat.id === expense.category_id);
            if (category) {
                if (!totals[category.name]) {
                    totals[category.name] = 0;
                }
                totals[category.name] += Number(expense.amount);
            }
        });
        return totals;
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    return (
        <main>
            <div className="container">
                <h1>Bilancio Attuale</h1>
                {dataLoaded ? (
                <div className="card">
                    <div className="card-header">Bilancio Attuale</div>
                    <div className="card-body">
                        <p><strong>Entrate Totali:</strong> €{formatNumber(totalIncome)}</p>
                        <p><strong>Spese Totali:</strong> €{formatNumber(totalExpense)}</p>
                        <p><strong>Bilancio:</strong> €{formatNumber(currentBalance)}</p>
                    </div>
                </div>
                ) : (
                <p>Loading...</p>
                )}
            </div>

            <div className="container">
                <h1>Aggiungi Spesa/Entrata</h1>
                <form onSubmit={addExpense}>
                    <div>
                        <label htmlFor="description">Descrizione:</label>
                        <input
                        type="text"
                        value={newExpense.description}
                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        id="description"
                        required
                        />
                    </div>
                    <div>
                        <label htmlFor="amount">Importo:</label>
                        <input
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                            id="amount"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="date">Data:</label>
                        <input
                            type="date"
                            value={newExpense.date}
                            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                            id="date"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category">Categoria:</label>
                        <select
                            value={newExpense.category_id}
                            onChange={(e) => setNewExpense({ ...newExpense, category_id: e.target.value })}
                            id="category"
                            required
                        >
                            <option disabled value="">Seleziona una categoria</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Aggiungi</button>
                </form>
            </div>

            <div className="container">
                <h1>Dettagli Entrate e Spese</h1>
                <div>
                    <label htmlFor="month">Seleziona Mese:</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        id="month"
                    />
                </div>
                <div>
                    <h2>Totali per Categoria</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Totale</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(calculateTotalsByCategory(filteredExpenses)).map(([category, total]) => (
                                <tr key={category} onClick={() => handleCategoryClick(category)}>
                                <td>{category}</td>
                                <td>€{formatNumber(total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                    {selectedCategory && (
                <div>
                    <h2>Dettagli per Categoria: {selectedCategory}</h2>
                    <table>
                    <thead>
                        <tr>
                        <th>Descrizione</th>
                        <th>Importo</th>
                        <th>Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.filter(expense => categories.find(cat => cat.name === selectedCategory)?.id === expense.category_id).map((expense) => (
                        <tr key={expense.id}>
                            <td>{expense.description}</td>
                            <td>€{formatNumber(Number(expense.amount))}</td>
                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                    )}
            </div>
        </main>
    );
};

export default App;