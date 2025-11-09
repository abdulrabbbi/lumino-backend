import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

export const PrintActivity = ({ activity, children }) => {
  const contentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: `${activity.title} - Activiteit`,
    onAfterPrint: () => console.log("Printed successfully")
  });

  return (
    <div>
      <div style={{ display: "none" }}>
        <div ref={contentRef} className="print-content p-6">
          <div className="print-header border-b-2 border-gray-300 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{activity.title}</h1>
            <p className="text-gray-600 mt-2">{activity.description}</p>
          </div>
          
          <div className="activity-details grid grid-cols-2 gap-4 mb-6">
            <div>
              <strong>Leeftijdsgroep:</strong> {activity.ageRange}
            </div>
            <div>
              <strong>Duur:</strong> {activity.progress}
            </div>
            <div>
              <strong>Leergebied:</strong> {activity.tag}
            </div>
            <div>
              <strong>Beoordeling:</strong> {activity.rating} ({activity.reviews})
            </div>
          </div>

          <div className="instructions mt-6">
            <h2 className="text-xl font-semibold mb-4">Activiteit Instructies</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>Deze activiteit helpt kinderen om {activity.tag.toLowerCase()} te ontwikkelen door middel van speelse oefeningen.</p>
              <p className="mt-2"><strong>Benodigdheden:</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Papier en potloden</li>
                <li>Kleurrijke materialen</li>
                <li>Open ruimte</li>
              </ul>
            </div>
          </div>

          <div className="footer mt-8 pt-4 border-t border-gray-300 text-sm text-gray-500">
            <p>Gedrukt van Speelweek Platform - {new Date().toLocaleDateString('nl-NL')}</p>
          </div>
        </div>
      </div>
      
      {children(handlePrint)}
    </div>
  );
};