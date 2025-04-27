import React from "react";
import { useParams, useNavigate } from "react-router-dom"; // 👈 agregamos useNavigate
import { useEffect, useState } from "react";

const SeatReceipt = () => {
    const { id, seatId } = useParams();
    const navigate = useNavigate(); // 👈 inicializamos navigate
    const [seat, setSeat] = useState(null);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
        const foundProject = storedProjects.find(p => p.id === parseInt(id));
        if (foundProject) {
            setProject(foundProject);
            const foundSeat = foundProject.seats.find(s => s.id === seatId);
            setSeat(foundSeat);
        }
    }, [id, seatId]);

    if (!seat) return <div>Cargando comprobante...</div>;

    const { totalDebit, totalCredit } = seat.details.reduce((totals, detail) => ({
        totalDebit: totals.totalDebit + (parseFloat(detail.debit) || 0),
        totalCredit: totals.totalCredit + (parseFloat(detail.credit) || 0),
    }), { totalDebit: 0, totalCredit: 0 });

    const [year, month, day] = seat.date ? seat.date.split("-") : ["", "", ""];

    const splitAccountCode = (account_code) => {
        if (!account_code) return { code: "", name: "" };
        const parts = account_code.split("-");
        const code = parts[0]?.trim() || "";
        const name = parts[1]?.trim() || "";
        return { code, name };
    };

    const getDescriptionParts = (description) => {
        if (!description) return [];
        return description.split(",").map(part => part.trim());
    };

    // Agrupar por cuenta principal
    const agrupado = {};

    seat.details.forEach((detail) => {
        const { code } = splitAccountCode(detail.account_code);
        const cuenta = code.substring(0, 4);
        if (!agrupado[cuenta]) agrupado[cuenta] = { cuenta, debit: 0, credit: 0, subcuentas: {} };

        const subcuenta = code.substring(0, 6);
        if (!agrupado[cuenta].subcuentas[subcuenta]) {
            agrupado[cuenta].subcuentas[subcuenta] = { subcuenta, auxiliares: [] };
        }

        agrupado[cuenta].subcuentas[subcuenta].auxiliares.push(detail);

        agrupado[cuenta].debit += parseFloat(detail.debit) || 0;
        agrupado[cuenta].credit += parseFloat(detail.credit) || 0;
    });

    const agrupadoArray = Object.values(agrupado);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-10 font-sans text-sm text-gray-800">
            {/* Botones */}
            <div className="flex justify-between mb-6">
                <button
                    onClick={() => navigate(`/seats/${id}`)}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                    ← Volver
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    🖨 Imprimir
                </button>
            </div>

            {/* Encabezado */}
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold">Comprobante Contable</h1>
                <div className="text-right border border-black px-4 py-2">
                    <strong>N° {seatId.slice(0, 5).toUpperCase()}</strong>
                </div>
            </div>

            {/* Fecha y descripción */}
            <div className="mb-6">
                <p className="mb-2"><strong>Fecha:</strong> {`${day || "--"}/${month || "--"}/${year || "--"}`}</p>
                <p><strong>Descripción:</strong> {seat.description}</p>
            </div>

            {/* Tabla contable */}
            <table className="w-full border-collapse text-center mb-6">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border p-2">CÓDIGO</th>
                        <th className="border p-2">CUENTAS Y DETALLES</th>
                        <th className="border p-2">PARCIALES</th>
                        <th className="border p-2">DÉBITO</th>
                        <th className="border p-2">CRÉDITO</th>
                    </tr>
                </thead>
                <tbody>
                    {agrupadoArray.map((grupo, idx) => (
                        <React.Fragment key={idx}>
                            {/* Cuenta principal */}
                            <tr className="border-b font-bold">
                                <td className="border p-2">{grupo.cuenta}</td>
                                <td className="border p-2 text-left">
                                    {(() => {
                                        const firstAux = Object.values(grupo.subcuentas)[0]?.auxiliares[0];
                                        const descParts = getDescriptionParts(firstAux?.description);
                                        return descParts[0] || "";
                                    })()}
                                </td>
                                <td className="border p-2"></td>
                                <td className="border p-2 text-right">
                                    {grupo.debit ? grupo.debit.toLocaleString("es-CO", { minimumFractionDigits: 2 }) : ""}
                                </td>
                                <td className="border p-2 text-right">
                                    {grupo.credit ? grupo.credit.toLocaleString("es-CO", { minimumFractionDigits: 2 }) : ""}
                                </td>
                            </tr>

                            {/* Subcuentas */}
                            {Object.values(grupo.subcuentas).map((sub, subIdx) => {
                                const firstAux = sub.auxiliares[0];
                                const descParts = getDescriptionParts(firstAux?.description);

                                return (
                                    <React.Fragment key={subIdx}>
                                        {/* Subcuenta */}
                                        <tr className="border-b">
                                            <td className="border p-2">{sub.subcuenta}</td>
                                            <td className="border p-2 text-left">{descParts[1] || ""}</td>
                                            <td className="border p-2"></td>
                                            <td className="border p-2"></td>
                                            <td className="border p-2"></td>
                                        </tr>

                                        {/* Auxiliares */}
                                        {sub.auxiliares.map((aux, auxIdx) => {
                                            const { code, name } = splitAccountCode(aux.account_code);
                                            const auxDescParts = getDescriptionParts(aux.description);

                                            return (
                                                <tr key={auxIdx} className="border-b">
                                                    <td className="border p-2">{code}</td>
                                                    <td className="border p-2 text-left">{auxDescParts[2] || name}</td>
                                                    <td className="border p-2 text-right">
                                                        {(parseFloat(aux.debit) || parseFloat(aux.credit))
                                                            ? (parseFloat(aux.debit) || parseFloat(aux.credit)).toLocaleString("es-CO", { minimumFractionDigits: 2 })
                                                            : ""}
                                                    </td>
                                                    <td className="border p-2"></td>
                                                    <td className="border p-2"></td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </React.Fragment>
                    ))}

                    {/* Totales */}
                    <tr className="font-bold">
                        <td className="border p-2" colSpan="3">TOTALES</td>
                        <td className="border p-2 text-right">{totalDebit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
                        <td className="border p-2 text-right">{totalCredit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</td>
                    </tr>
                </tbody>
            </table>

            {/* Validación de saldos */}
            <div className="flex justify-end mb-10">
                {totalDebit === totalCredit ? (
                    <span className="text-green-600 font-bold">✅ Saldos Iguales</span>
                ) : (
                    <span className="text-red-600 font-bold">❌ Saldos Descuadrados</span>
                )}
            </div>

            {/* Firmas */}
            <div className="grid grid-cols-3 gap-10 mt-10">
                <div className="text-center">
                    <div className="font-bold">{project?.companyName || "Nombre Empresa"}</div>
                    <div className="border-t border-black pt-2 mt-2">Elaborado por</div>
                </div>
                <div className="text-center">
                    <div className="italic">{project?.auditorName || "Nombre Revisor Fiscal"}</div>
                    <div className="border-t border-black pt-2 mt-2">Revisado por</div>
                </div>
                <div className="text-center">
                    <div className="italic">{project?.auditorName || "Nombre Revisor Fiscal"}</div>
                    <div className="border-t border-black pt-2 mt-2">Aprobado por</div>
                </div>
            </div>
        </div>
    );
};

export default SeatReceipt;
