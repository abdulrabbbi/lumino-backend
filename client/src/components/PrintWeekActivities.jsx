import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

export const PrintWeekActivities = ({ weekActivities, weekInfo, children }) => {
  const contentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: `Speelweek ${weekInfo?.weekNumber} - Activiteiten`,
    onAfterPrint: () => console.log("Week activities printed successfully")
  });

  return (
    <div>
      <div style={{ display: "none" }}>
        <div ref={contentRef} className="print-content p-6">
          <div className="print-header border-b-2 border-gray-300 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              Speelweek {weekInfo?.weekNumber}
            </h1>
            <p className="text-gray-600 text-center mt-2">
              5 zorgvuldig geselecteerde activiteiten om samen te ontdekken
            </p>
            <p className="text-gray-500 text-center text-sm mt-1">
              Gedrukt op {new Date().toLocaleDateString('nl-NL')}
            </p>
          </div>
          
          <div className="week-activities space-y-6">
            {weekActivities.map((activity, index) => (
              <div key={activity.id} className="activity-page break-inside-avoid">
                <div className="activity-item border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Dag {index + 1}: {activity.title}
                    </h2>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {activity.tag}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{activity.description}</p>
                  
                  <div className="activity-meta grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <strong>Leeftijd:</strong> {activity.ageRange}
                    </div>
                    <div>
                      <strong>Duur:</strong> {activity.progress}
                    </div>
                    <div>
                      <strong>Beoordeling:</strong> {activity.rating}/5
                    </div>
                    <div>
                      <strong>Beoordelingen:</strong> {activity.reviews}
                    </div>
                  </div>

                  <div className="instructions mt-4 p-3 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Hoe te spelen:</h3>
                    <p>Deze activiteit helpt bij het ontwikkelen van {activity.tag.toLowerCase()} vaardigheden.</p>
                    
                    <h4 className="font-medium mt-3 mb-1">Benodigdheden:</h4>
                    <ul className="list-disc list-inside ml-2 text-sm">
                      <li>Basismaterialen uit huis</li>
                      <li>Creatieve mindset</li>
                      <li>Ongeveer {activity.progress} tijd</li>
                    </ul>
                  </div>
                </div>
                
                {index < weekActivities.length - 1 && (
                  <div className="page-break" style={{pageBreakAfter: 'always'}}></div>
                )}
              </div>
            ))}
          </div>

          <div className="footer mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-500">
            <p>Speelweek Platform - Samen groeien met elke activiteit</p>
          </div>
        </div>
      </div>
      
      {children(handlePrint)}
    </div>
  );
};