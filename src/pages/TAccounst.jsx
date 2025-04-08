import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";

const TAccounts = () => {
    const { id } = useParams();
    const [tAccounts, setTAccounts] = useState([]);

    useEffect(() => {
        const loadTAccounts = () => {
            const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
            const project = storedProjects.find((p) => p.id === parseInt(id)) || {};
            const seats = project.seats || [];
            const accountsMap = {};

            seats.forEach(seat => {
                seat.details.forEach(detail => {
                    const { account_code, debit, credit, description } = detail;
                    const subAccountCode = account_code.substring(0, 6); // Agrupamos por subcuenta
                    const nature = ['1', '5', '6'].includes(subAccountCode[0]) ? 'debit' : 'credit';

                    if (!accountsMap[subAccountCode]) {
                        accountsMap[subAccountCode] = {
                            account_code: subAccountCode,
                            entries: [],
                            totalDebit: 0,
                            totalCredit: 0,
                            nature: nature
                        };
                    }

                    const debitValue = parseFloat(debit) || 0;
                    const creditValue = parseFloat(credit) || 0;

                    accountsMap[subAccountCode].entries.push({
                        date: seat.date,
                        description: description,
                        debit: debitValue,
                        credit: creditValue
                    });

                    accountsMap[subAccountCode].totalDebit += debitValue;
                    accountsMap[subAccountCode].totalCredit += creditValue;
                });
            });

            // Ajustar los saldos al lado correcto según naturaleza
            const accountList = Object.values(accountsMap).map(account => {
                let finalDebit = 0;
                let finalCredit = 0;

                if (account.nature === 'debit') {
                    finalDebit = account.totalDebit - account.totalCredit;
                    if (finalDebit < 0) {
                        finalCredit = Math.abs(finalDebit);
                        finalDebit = 0;
                    }
                } else {
                    finalCredit = account.totalCredit - account.totalDebit;
                    if (finalCredit < 0) {
                        finalDebit = Math.abs(finalCredit);
                        finalCredit = 0;
                    }
                }

                return { ...account, finalDebit, finalCredit };
            });

            setTAccounts(accountList);
        };

        loadTAccounts();
    }, [id]);

    const formatCurrency = (amount) => {
        return amount.toLocaleString("es-ES", { minimumFractionDigits: 2 });
    };

    return (
        <BaseLayout title={`Cuentas T - Proyecto ${id}`}>
            {tAccounts.map(account => (
                <div key={account.account_code} className="bg-white p-6 rounded-lg shadow-lg mb-6">
                    <h2 className="text-xl font-bold">Cuenta T: {account.account_code}</h2>
                    <table className="w-full border-collapse text-sm text-center mt-4">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2">Fecha</th>
                                <th className="p-2">Descripción</th>
                                <th className="p-2">Débito</th>
                                <th className="p-2">Crédito</th>
                            </tr>
                        </thead>
                        <tbody>
                            {account.entries.map((entry, index) => (
                                <tr key={index} className="border-t">
                                    <td className="p-2">{entry.date}</td>
                                    <td className="p-2">{entry.description}</td>
                                    <td className="p-2">
                                        {entry.debit > 0 ? formatCurrency(entry.debit) : ""}
                                    </td>
                                    <td className="p-2">
                                        {entry.credit > 0 ? formatCurrency(entry.credit) : ""}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-100">
                            <tr>
                                <td colSpan="2" className="p-2 font-bold">Totales</td>
                                <td className="p-2 font-bold">{formatCurrency(account.totalDebit)}</td>
                                <td className="p-2 font-bold">{formatCurrency(account.totalCredit)}</td>
                            </tr>
                            <tr>
                                <td colSpan="2" className="p-2 font-bold">Saldo Final</td>
                                <td className={`p-2 font-bold text-lg ${account.finalDebit > 0 ? 'text-green-600' : ''}`}>
                                    {account.finalDebit > 0 ? formatCurrency(account.finalDebit) : ""}
                                </td>
                                <td className={`p-2 font-bold text-lg ${account.finalCredit > 0 ? 'text-red-600' : ''}`}>
                                    {account.finalCredit > 0 ? formatCurrency(account.finalCredit) : ""}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ))}
        </BaseLayout>
    );
};

export default TAccounts;
