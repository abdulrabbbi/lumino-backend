/* eslint-disable no-unused-vars */
import { useState } from "react"
import { Edit, Check, Trash, ChevronLeft, ChevronRight, X, ArrowLeft, Users, Lightbulb, Send, Clock } from "lucide-react"
import { ToastContainer, toast } from "react-toastify"
import usePendingApprovalActivitiesAdmin from "../../hooks/usePendingApprovalActivitiesAdmin"
import useActivityActions from "../../hooks/useActivityActions"
import "react-toastify/dist/ReactToastify.css"
import LoaderOverlay from "../../components/LoaderOverlay"

export default function IngezondenActiviteiten() {
  const activitiesPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("list")
  const [deleteModal, setDeleteModal] = useState({ open: false, activityId: null })
  const [approveModal, setApproveModal] = useState({ open: false, activityId: null })
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    instructions: [],
    materials: "",
    learningDomain: "",
    category: "",
    time: "", 
    ageGroup: "", 
    editingId: null,
  })

  const [titleCount, setTitleCount] = useState(0)
  const [descriptionCount, setDescriptionCount] = useState(0)

  const { activities, totalActivities, loading, setActivities } = usePendingApprovalActivitiesAdmin(
    currentPage,
    activitiesPerPage,
  )
  const { approveActivity, deleteActivity, editActivity } = useActivityActions(setActivities)


  const pendingActivitiesAll = activities.filter((a) => !a.isApproved)
const pendingActivities = pendingActivitiesAll.slice(
  (currentPage - 1) * activitiesPerPage,
  currentPage * activitiesPerPage
)
const pendingCount = pendingActivitiesAll.length
const totalPages = Math.ceil(pendingCount / activitiesPerPage)


  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const startEdit = (activity) => {
    setEditData({
      title: activity.title,
      description: activity.description || "",
      instructions: [...activity.instructions],
      materials: activity.materials || "",
      learningDomain: activity.learningDomain || "",
      category: activity.category || "library",
      time: activity.time || "",
      ageGroup: activity.ageGroup || "", 
      editingId: activity._id,
    })
    setTitleCount(activity.title.length)
    setDescriptionCount((activity.description || "").length)
    setActiveTab("edit")
  }

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))

    switch (field) {
      case "title":
        setTitleCount(value.length)
        break
      case "description":
        setDescriptionCount(value.length)
        break
    }
  }

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...editData.instructions]
    newInstructions[index] = value
    setEditData({ ...editData, instructions: newInstructions })
  }

  const addInstruction = () => {
    setEditData({ ...editData, instructions: [...editData.instructions, ""] })
  }

  const removeInstruction = (index) => {
    const newInstructions = [...editData.instructions]
    newInstructions.splice(index, 1)
    setEditData({ ...editData, instructions: newInstructions })
  }

  const handleEditSave = async () => {
    if (!editData.title || !editData.description || !editData.learningDomain) {
      toast.error("Vul alle verplichte velden in")
      return
    }

    try {
      await editActivity(editData.editingId, editData)
      toast.success("Activiteit bijgewerkt!")
      setActiveTab("list")
      setEditData({
        title: "",
        description: "",
        instructions: [],
        materials: "",
        learningDomain: "",
        editingId: null,
      })
      setTitleCount(0)
      setDescriptionCount(0)
    } catch (err) {
      toast.error(err)
    }
  }

  const handleApprove = async (id) => {
    try {
      await approveActivity(id)
      toast.success("Activiteit goedgekeurd!")
      setApproveModal({ open: false, activityId: null })
    } catch (err) {
      toast.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteActivity(id)
      toast.success("Activiteit verwijderd!")
      setDeleteModal({ open: false, activityId: null })
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <div className="h-auto min-h-screen py-8">
      <ToastContainer style={{ zIndex: 10000000000 }} />
      <div className="max-w-7xl mx-auto">
        {activeTab === "list" ? (
          <div className="border border-[#E2E4E9] p-6 rounded-xl bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold">Ingezonden Activiteiten</h1>
                <span className="py-1 px-4 text-sm rounded-3xl bg-[#8937EA] text-white text-sm mt-2 inline-block">
                  {pendingCount} wachtend
                </span>
                <p className="text-[#838383] mt-2 text-sm">Activiteiten die wachten op goedkeuring.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ingezonden door
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domein</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                     <LoaderOverlay/>
                    ) : pendingActivities.length > 0 ? (
                      pendingActivities.map((activity) => (
                        <tr key={activity._id}>
                          <td className="px-6 inter-tight-400 text-[15px] py-4">{activity.title}</td>
                          <td className="px-6 inter-tight-400 text-[15px] py-4">{activity.creatorName || "-"}</td>
                          <td className="px-6 inter-tight-400 text-[15px] py-4">{activity.learningDomain || "-"}</td>
                          <td className="px-6 inter-tight-400 text-[15px] py-4">{new Date(activity.createdAt).toLocaleDateString("nl-NL")}</td>
                          <td className="px-6 inter-tight-400 text-[15px] py-4 cursor-pointer text-right space-x-2">
                            <button onClick={() => startEdit(activity)} title="Bewerken">
                              <Edit className="w-5 h-5 cursor-pointer bg-gray-50 rounded-md text-indigo-600 hover:text-indigo-900" />
                            </button>
                            <button
                              onClick={() => setApproveModal({ open: true, activityId: activity._id })}
                              title="Goedkeuren"
                            >
                              <Check className="w-5 h-5 cursor-pointer bg-gray-50 rounded-md text-green-600 hover:text-green-900" />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ open: true, activityId: activity._id })}
                              title="Verwijderen"
                            >
                              <Trash className="w-5 h-5 cursor-pointer bg-gray-50 rounded-md text-red-600 hover:text-red-900" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-500">
                          Geen activiteiten wachtend op goedkeuring
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                    {/* <div className="text-sm text-gray-700">
                    Toon {(currentPage - 1) * activitiesPerPage + 1} tot{" "}
                    {Math.min(currentPage * activitiesPerPage, totalActivities)} van {totalActivities} activiteiten
                    </div> */}
                <div className="flex inter-tight-400 text-sm cursor-pointer space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md bg-gray-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-3 py-1 rounded-md ${page === currentPage ? "bg-[#8937EA] text-white" : "bg-gray-200"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md bg-gray-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-[#E2E4E9] p-6 rounded-xl bg-white">
            <div className="mb-8">
              <button
                onClick={() => setActiveTab("list")}
                className="flex cursor-pointer items-center gap-2 text-[#4B5563] hover:bg-yellow-400 hover:text-black py-2 px-6 duration-500 ease-in-out rounded-md transition-colors mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Terug naar activiteiten</span>
              </button>

              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-[#6366F1] rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-3">Activiteit Bewerken</h1>
                  <p className="text-[#6B7280] text-[16px] max-w-md mx-auto">Bewerk de details van deze activiteit</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
                  <h2 className="text-2xl font-semibold text-[#000000]">Activiteit Details</h2>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-2">
                    Titel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Bijvoorbeeld: Kleurrijke Natuur Ontdekkingstocht"
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                    maxLength={60}
                  />
                  <p className="text-xs text-[#6B7280] mt-1">Maximaal 60 tekens ({titleCount}/60)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-2">
                    Beschrijving <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Beschrijf in het kort waar deze activiteit over gaat..."
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm resize-none"
                    rows="4"
                    maxLength={250}
                  />
                  <p className="text-xs text-[#6B7280] mt-1">Maximaal 250 tekens ({descriptionCount}/250)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-2">Benodigd materiaal</label>
                  <input
                    type="text"
                    value={editData.materials}
                    onChange={(e) => handleInputChange("materials", e.target.value)}
                    placeholder="Papier, kleurpotloden, telefoon voor foto's"
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-[#6B7280] mt-1">Kommagescheiden lijst van benodigdheden (optioneel)</p>
                </div>

                <div className="">
                    <div>
                      <label className="block text-sm font-medium text-[#000000] mb-2">
                        Leergebied voor alle activiteiten <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editData.learningDomain}
                        onChange={(e) => handleInputChange('learningDomain', e.target.value)}
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm appearance-none"
                        required
                      >
                        <option value="">Selecteer een leergebied</option>
                        <option value="Emotionele gezondheid">Emotionele Gezondheid</option>
                        <option value="Veerkracht">Veerkracht</option>
                        <option value="Dankbaarheid">Dankbaarheid</option>
                        <option value="Zelfzorg">Zelfzorg</option>
                        <option value="Geldwijsheid">Geldwijsheid</option>
                        <option value="Ondernemerschap">Ondernemerschap</option>
                        <option value="Anders denken">Anders denken</option>
                      </select>
                    </div>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-2">Instructies</label>
                  <div className="space-y-2">
                    {editData.instructions.map((instruction, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
                          value={instruction}
                          onChange={(e) => handleInstructionChange(index, e.target.value)}
                          placeholder={`Instructie stap ${index + 1}`}
                        />
                        <button
                          onClick={() => removeInstruction(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addInstruction}
                      className="mt-2 text-sm text-[#6366F1] hover:text-[#4F46E5] flex items-center gap-1"
                    >
                      <span>Instructie toevoegen</span>
                    </button>
                  </div>
                </div>

                <div>
  <label className="block text-sm font-medium text-[#000000] mb-2">
    Geschatte duur (minuten)
  </label>
  <div className="relative flex items-center">
    <input
      type="text"
      value={editData.time}
      onChange={(e) => handleInputChange('time', e.target.value)}
      placeholder="Bijvoorbeeld: 10 of 10-15"
      className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
    />
    <Clock className="w-4 h-4 text-gray-400 absolute right-3" />
  </div>
  <p className="text-xs text-[#6B7280] mt-1">
    Voer een getal in (bijv. "10") of bereik (bijv. "10-15")
  </p>
</div>

<div>
  <label className="block text-sm font-medium text-[#000000] mb-2">
    Leeftijdsgroep <span className="text-red-500">*</span>
  </label>
  <select
  value={editData.ageGroup}
  onChange={(e) => handleInputChange('ageGroup', e.target.value)}
  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent text-sm"
  required
>
  <option value="">Selecteer een leeftijdsgroep</option>
  <option value="3 - 4">Leeftijd 3 - 4</option>
  <option value="3 - 6">Leeftijd 3 - 6</option>
  <option value="5 - 6">Leeftijd 5 - 6</option>
  <option value="7 - 8">Leeftijd 7 - 8</option>
</select>

</div>

                <button
                  type="button"
                  onClick={handleEditSave}
                  className="w-full bg-gradient-to-r cursor-pointer from-[#6366F1] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] text-white py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Activiteit Bijwerken
                </button>
              </div>
            </div>
          </div>
        )}

        {approveModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-medium inter-tight-700">Activiteit goedkeuren</h3>
              <p className="text-sm text-gray-500 mb-6 inter-tight-400">Weet u zeker dat u deze activiteit wilt goedkeuren?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setApproveModal({ open: false, activityId: null })}
                  className="px-4 py-2 inter-tight-400 text-sm cursor-pointer border border-gray-300 rounded-md"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => handleApprove(approveModal.activityId)}
                  className="px-4 py-2 inter-tight-400 text-sm cursor-pointer bg-green-600 text-white rounded-md"
                >
                  Goedkeuren
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-medium inter-tight-700">Activiteit verwijderen</h3>
              <p className="text-sm text-gray-500 mb-6 inter-tight-400">Weet u zeker dat u deze activiteit wilt verwijderen?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModal({ open: false, activityId: null })}
                  className="px-4 py-2 border text-sm inter-tight-400 cursor-pointer border-gray-300 rounded-md"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.activityId)}
                  className="px-4 py-2 text-sm inter-tight-400 cursor-pointer bg-red-600 text-white rounded-md"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}