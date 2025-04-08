import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";
import { v4 as uuidv4 } from 'uuid';
import BaseLayout from "../layouts/BaseLayout";

const initialDetail = {
    account_code: "",
    description: "",
    debit: 0,
    credit: 0,
};

const Seats = () => {
    const { id } = useParams();
    const [seats, setSeats] = useState([]);
    const [usedAccounts, setUsedAccounts] = useState([]);
    const lastSeatRef = useRef(null);
    const [seatCounter, setSeatCounter] = useState(1);

    // Load seats from local storage
    useEffect(() => {
        const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
        const project = storedProjects.find((p) => p.id === parseInt(id)) || {};
        setSeats(project.seats || []);
    }, [id]);

    // Update seatCounter when seats change
    useEffect(() => {
        setSeatCounter(seats.length > 0 ? seats.length + 1 : 1);
    }, [seats]);

    // Calculate used accounts
    useEffect(() => {
        const accountsSet = new Set();

        seats.forEach((seat) =>
            seat.details.forEach((detail) => {
                if (detail.account_code) accountsSet.add(detail.account_code);
            })
        );

        setUsedAccounts(Array.from(accountsSet).map(code => ({ value: code, label: code })));
    }, [seats]);

    // Save seats to local storage
    const saveSeats = (updatedSeats) => {
        const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
        const projectIndex = storedProjects.findIndex((p) => p.id === parseInt(id));

        if (projectIndex === -1) return;

        if (projectIndex !== -1) {
            storedProjects[projectIndex].seats = updatedSeats;
            localStorage.setItem("projects", JSON.stringify(storedProjects));
        }
    };

    // Agregar un nuevo asiento vacío
    const addNewSeat = () => {
        const updatedSeats = [...seats, { id: uuidv4(), project_id: parseInt(id), date: "", description: "", details: [] }];

        setSeats(updatedSeats);
        saveSeats(updatedSeats);
        setTimeout(() => { lastSeatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    };

    // Delete a seat
    const deleteSeat = (seatId) => {
        const updatedSeats = seats.filter(seat => seat.id !== seatId);


        setSeats(updatedSeats);
        saveSeats(updatedSeats);
    };

    // Manejar cambios en los campos del asiento
    const handleSeatChange = (seatIndex, field, value) => {
        const updatedSeats = [...seats];
        updatedSeats[seatIndex][field] = value;
        setSeats(updatedSeats);
        saveSeats(updatedSeats);
    };

    // Add detail row to a seat
    const addDetailRow = (seatIndex) => {
        const updatedSeats = [...seats];
        updatedSeats[seatIndex].details.push({ ...initialDetail });

        setSeats(updatedSeats);
        saveSeats(updatedSeats);

    };

    // Manejar cambios en los detalles
    const handleDetailChange = (seatIndex, detailIndex, field, value) => {
        const updatedSeats = [...seats];
        updatedSeats[seatIndex].details[detailIndex][field] = value;

        if (field === "account_code" && value) {
            const alreadyExists = usedAccounts.some(acc => acc.value === value);
            if (!alreadyExists) {
                setUsedAccounts(prev => [...prev, { value, label: value }]);
            }
        }

        setSeats(updatedSeats);
        saveSeats(updatedSeats);
    };

    // Remove detail row
    const removeDetailRow = (seatIndex, detailIndex) => {
        const updatedSeats = [...seats];
        updatedSeats[seatIndex].details.splice(detailIndex, 1);
        setSeats(updatedSeats);
        saveSeats(updatedSeats);
    };

    // Calculate debit and credit totals
    const calculateTotals = (seatIndex) => {
        const { details } = seats[seatIndex];
        const totalDebit = details.reduce((sum, detail) => sum + (parseFloat(detail.debit) || 0), 0);
        const totalCredit = details.reduce((sum, detail) => sum + (parseFloat(detail.credit) || 0), 0);
        return { totalDebit, totalCredit };
    };

    return (
        <BaseLayout title={`Gestión de Asientos - Proyecto ${id}`}>
            {seats.map((seat, seatIndex) => {
                const { totalDebit, totalCredit } = calculateTotals(seatIndex);

                return (
                    <div key={seat.id} ref={seatIndex === seats.length - 1 ? lastSeatRef : null} className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Asiento #{seatIndex + 1}</h2>
                            <button
                                onClick={() => deleteSeat(seat.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                            >
                                🗑 Eliminar Asiento
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="col-span-1">
                                {/* Fecha del asiento */}
                                <input
                                    type="date"
                                    value={seat.date}
                                    onChange={(e) => handleSeatChange(seatIndex, "date", e.target.value)}
                                    className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="md:col-span-3 col-span-1">
                                {/* Descripción del asiento */}{" "}
                                <input
                                type="text"
                                    placeholder="Descripción"
                                    value={seat.description}
                                    onChange={(e) => handleSeatChange(seatIndex, "description", e.target.value)}
                                    className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Tabla de detalles */}
                        <table className="w-full border-collapse text-sm text-center">
                            <thead className="bg-gray-200">
                                <tr className="">
                                    <th className="p-2">Código Cuenta</th>
                                    <th className="p-2">Descripción</th>
                                    <th className="p-2">Débito</th>
                                    <th className="p-2">Crédito</th>
                                    <th className="p-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seat.details.map((detail, detailIndex) => (
                                    <tr key={detailIndex} className="border-t">
                                        <td className="p-2">
                                        <Select
                                            options={usedAccounts}
                                            isClearable
                                            isSearchable
                                            value={usedAccounts.find(acc => acc.value === detail.account_code) || { value: detail.account_code, label: detail.account_code }}
                                            onChange={(selectedOption) => {
                                                handleDetailChange(seatIndex, detailIndex, "account_code", selectedOption ? selectedOption.value : "");
                                            }}
                                            onInputChange={(inputValue, { action }) => {
                                                if (action === "input-change") {
                                                    handleDetailChange(seatIndex, detailIndex, "account_code", inputValue);
                                                }
                                            }}
                                            placeholder="Seleccione o escriba..."
                                            className="w-full border rounded-md"
                                        />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="text"
                                                value={detail.description}
                                                onChange={(e) => handleDetailChange(seatIndex, detailIndex, "description", e.target.value)}
                                                className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={detail.debit}
                                                onChange={(e) => handleDetailChange(seatIndex, detailIndex, "debit", e.target.value)}
                                                className="border p-2 rounded-md w-full text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                required
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={detail.credit}
                                                onChange={(e) => handleDetailChange(seatIndex, detailIndex, "credit", e.target.value)}
                                                className="border p-2 rounded-md w-full text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                required
                                            />
                                        </td>
                                        <td className="p-2">
                                            <button onClick={() => removeDetailRow(seatIndex, detailIndex)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
                                                🗑</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totales y validación de saldos */}
                        <div className="mt-4">
                            <strong>Totales:</strong> <span className="font-mono">Débito: {totalDebit}</span> | <span className="font-mono">Crédito: {totalCredit}</span> <span className={totalDebit === totalCredit ? "text-green-600" : "text-red-600"}>{totalDebit === totalCredit ? " ✅ Saldos Iguales" : " ❌ Saldos Descuadrados"}</span>
                        </div>

                        {/* Botón para agregar fila */}
                        <button onClick={() => addDetailRow(seatIndex)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-4">
                            + Agregar Fila
                        </button>
                    </div>
                );
            })}

            {/* Botón para agregar asiento */}
            <button
                onClick={addNewSeat}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mb-4 mt-4"
            >
                + Agregar Asiento
            </button>
        </BaseLayout>
    );
};

export default Seats;
