import React from 'react';

const PlanSelector = ({ plans, selectedPlan, onSelectPlan }) => {
    return (
        <div className="plan-selector">
            <h2>Select a Subscription Plan</h2>
            <ul>
                {plans.map(plan => (
                    <li key={plan.id} className={selectedPlan === plan.id ? 'selected' : ''}>
                        <button onClick={() => onSelectPlan(plan.id)}>
                            {plan.name} - ${plan.price}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlanSelector;