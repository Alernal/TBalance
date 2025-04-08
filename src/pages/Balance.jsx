import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";

const Balance = () => {
    const { id } = useParams();
    const [accounts, setAccounts] = useState([]);
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);

    useEffect(() => {
        const loadBalance = () => {
            const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
            const project = storedProjects.find((p) => p.id === parseInt(id)) || {};
            const seats = project.seats || [];
            const accountsMap = {};

            seats.forEach(seat => {
                seat.details.forEach(detail => {
                    const { account_code, debit, credit } = detail;
                    const accountMainCode = account_code.substring(0, 4); // Agrupamos por los primeros 4 dígitos
                    const nature = ['1', '5', '6'].includes(accountMainCode[0]) ? 'debit' : 'credit';

                    if (!accountsMap[accountMainCode]) {
                        accountsMap[accountMainCode] = {
                            account_code: accountMainCode,
                            totalDebit: 0,
                            totalCredit: 0,
                            nature: nature
                        };
                    }

                    const debitValue = parseFloat(debit) || 0;
                    const creditValue = parseFloat(credit) || 0;

                    accountsMap[accountMainCode].totalDebit += debitValue;
                    accountsMap[accountMainCode].totalCredit += creditValue;
                });
            });

            // Ajustar el saldo final al lado correcto según la naturaleza de la cuenta
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

            setAccounts(accountList);

            // Calcular los totales de débito y crédito correctamente
            const debitSum = accountList.reduce((sum, acc) => sum + acc.finalDebit, 0);
            const creditSum = accountList.reduce((sum, acc) => sum + acc.finalCredit, 0);

            setTotalDebit(debitSum);
            setTotalCredit(creditSum);
        };

        loadBalance();
    }, [id]);

    const formatCurrency = (amount) => {
        return amount.toLocaleString("es-ES", { minimumFractionDigits: 2 });
    };

    return (
        <BaseLayout title={`Balance de Comprobación - Proyecto ${id}`}>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Balance de Comprobación</h2>
                <table className="w-full border-collapse text-sm text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2">Cuenta</th>
                            <th className="p-2">Débito</th>
                            <th className="p-2">Crédito</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(account => (
                            <tr key={account.account_code} className="border-t">
                                <td className="p-2">{account.account_code}</td>
                                <td className={`p-2 ${account.finalDebit > 0 ? 'text-green-600 font-bold' : ''}`}>
                                    {account.finalDebit > 0 ? formatCurrency(account.finalDebit) : ""}
                                </td>
                                <td className={`p-2 ${account.finalCredit > 0 ? 'text-red-600 font-bold' : ''}`}>
                                    {account.finalCredit > 0 ? formatCurrency(account.finalCredit) : ""}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                        <tr>
                            <td className="p-2 font-bold">Totales</td>
                            <td className="p-2 font-bold text-green-600">{formatCurrency(totalDebit)}</td>
                            <td className="p-2 font-bold text-red-600">{formatCurrency(totalCredit)}</td>
                        </tr>
                    </tfoot>
                </table>

                {totalDebit !== totalCredit && (
                    <div className="mt-4 p-3 bg-red-100 text-red-600 font-bold rounded-lg">
                        ⚠️ El balance no cuadra, revisa los asientos contables.
                    </div>
                )}
            </div>
        </BaseLayout>
    );
};

export default Balance;
