'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { proxyFetch, proxyUpsert } from '@/lib/proxy-db';
import { useWizard } from '../../layout';

const FOOD_CATEGORIES = [
  'caffeine', 'sugar_sweets', 'fried_foods', 'spicy_foods', 'fermented_foods',
  'dairy', 'gluten_wheat', 'beans_legumes', 'raw_salads', 'leftovers', 'eating_out',
];

const FOOD_CATEGORY_LABELS: Record<string, string> = {
  caffeine: 'Caffeine', sugar_sweets: 'Sugar/Sweets', fried_foods: 'Fried Foods',
  spicy_foods: 'Spicy Foods', fermented_foods: 'Fermented Foods', dairy: 'Dairy',
  gluten_wheat: 'Gluten/Wheat', beans_legumes: 'Beans/Legumes', raw_salads: 'Raw Foods/Salads',
  leftovers: 'Leftovers/Reheated', eating_out: 'Eating Out/Takeaway',
};

const CATEGORY_ICONS: Record<string, string> = {
  caffeine: '☕', sugar_sweets: '🍬', fried_foods: '🍟', spicy_foods: '🌶️',
  fermented_foods: '🥒', dairy: '🥛', gluten_wheat: '🌾', beans_legumes: '🫘',
  raw_salads: '🥗', leftovers: '📦', eating_out: '🍽️',
};

export default function FoodDiaryDayPage() {
  const params = useParams();
  const router = useRouter();
  const { assessmentId } = useWizard();
  const dayNumber = parseInt(params.day as string) || 0;

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    wakeTime: '',
    breakfast: { time: '', food: '', categories: [] as string[] },
    lunch: { time: '', food: '', categories: [] as string[] },
    dinner: { time: '', food: '', categories: [] as string[] },
    snacks: { time: '', food: '', categories: [] as string[] },
    caffeine: false, sugarSweets: false, friedFoods: false, spicyFoods: false,
    fermentedFoods: false, dairy: false, glutenWheat: false, beansLegumes: false,
    rawSalads: false, leftovers: false, eatingOut: false,
    mealSize: 'medium', eatingSpeed: 'moderate', hungerBeforeMeals: 'normal' as string,
    symptomsAfterMeals: [] as string[],
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!assessmentId || loaded) return;
    (async () => {
      try {
        const { data } = await proxyFetch('food_diary_entries', { assessment_id: assessmentId, day_number: dayNumber });
        if (data?.[0]) {
          const d = data[0];
          setForm({
            date: d.date || new Date().toISOString().split('T')[0],
            wakeTime: d.wake_time || '',
            breakfast: d.breakfast || { time: '', food: '', categories: [] },
            lunch: d.lunch || { time: '', food: '', categories: [] },
            dinner: d.dinner || { time: '', food: '', categories: [] },
            snacks: d.snacks || { time: '', food: '', categories: [] },
            caffeine: d.caffeine || false, sugarSweets: d.sugar_sweets || false,
            friedFoods: d.fried_foods || false, spicyFoods: d.spicy_foods || false,
            fermentedFoods: d.fermented_foods || false, dairy: d.dairy || false,
            glutenWheat: d.gluten_wheat || false, beansLegumes: d.beans_legumes || false,
            rawSalads: d.raw_salads || false, leftovers: d.leftovers || false,
            eatingOut: d.eating_out || false,
            mealSize: d.meal_size || 'medium', eatingSpeed: d.eating_speed || 'moderate',
            hungerBeforeMeals: d.hunger_before_meals || 'normal',
            symptomsAfterMeals: d.symptoms_after_meals || [],
          });
        }
        setLoaded(true);
      } catch (err) { console.error(err); }
    })();
  }, [assessmentId, dayNumber, loaded]);

  const save = async () => {
    if (!assessmentId) return;
    if (!dayNumber || dayNumber < 1 || dayNumber > 7) {
      console.error('Invalid day number:', dayNumber, 'params:', params);
      alert('Invalid day number. Please refresh the page.');
      return;
    }
    try {
      const res = await proxyUpsert('food_diary_entries', {
        assessment_id: assessmentId, day_number: dayNumber, date: form.date,
        wake_time: form.wakeTime || null, breakfast: form.breakfast, lunch: form.lunch,
        dinner: form.dinner, snacks: form.snacks,
        caffeine: form.caffeine, sugar_sweets: form.sugarSweets, fried_foods: form.friedFoods,
        spicy_foods: form.spicyFoods, fermented_foods: form.fermentedFoods,
        dairy: form.dairy, gluten_wheat: form.glutenWheat, beans_legumes: form.beansLegumes,
        raw_salads: form.rawSalads, leftovers: form.leftovers, eating_out: form.eatingOut,
        meal_size: form.mealSize, eating_speed: form.eatingSpeed,
        hunger_before_meals: form.hungerBeforeMeals, symptoms_after_meals: form.symptomsAfterMeals,
      }, 'assessment_id, day_number');
      if (res?.error) {
        console.error('Food diary save error:', res.error);
        alert('Failed to save. Check console for details.');
      }
    } catch (err) { console.error(err); alert('Failed to save: ' + err); }
  };

  const updateMeal = (meal: 'breakfast' | 'lunch' | 'dinner' | 'snacks', field: string, value: any) => {
    setForm(prev => ({ ...prev, [meal]: { ...prev[meal], [field]: value } }));
  };

  const copyFromPreviousDay = async () => {
    if (dayNumber <= 1) return;
    let data;
    try {
      const result = await proxyFetch('food_diary_entries', { assessment_id: assessmentId, day_number: dayNumber - 1 });
      data = result.data?.[0];
    } catch (err) { console.error(err); return; }
    if (data) {
      setForm({
        date: new Date().toISOString().split('T')[0], wakeTime: data.wake_time || '',
        breakfast: data.breakfast || { time: '', food: '', categories: [] },
        lunch: data.lunch || { time: '', food: '', categories: [] },
        dinner: data.dinner || { time: '', food: '', categories: [] },
        snacks: data.snacks || { time: '', food: '', categories: [] },
        caffeine: data.caffeine || false, sugarSweets: data.sugar_sweets || false,
        friedFoods: data.fried_foods || false, spicyFoods: data.spicy_foods || false,
        fermentedFoods: data.fermented_foods || false, dairy: data.dairy || false,
        glutenWheat: data.gluten_wheat || false, beansLegumes: data.beans_legumes || false,
        rawSalads: data.raw_salads || false, leftovers: data.leftovers || false,
        eatingOut: data.eating_out || false,
        mealSize: data.meal_size || 'medium', eatingSpeed: data.eating_speed || 'moderate',
        hungerBeforeMeals: data.hunger_before_meals || 'normal',
        symptomsAfterMeals: data.symptoms_after_meals || [],
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Day {dayNumber} of 7</p>
          <input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
            className="mt-1 rounded-lg border border-gray-300 px-3 py-1 text-sm" />
        </div>
        {dayNumber > 1 && (
          <button onClick={copyFromPreviousDay} className="text-sm text-amber-700 hover:text-amber-800">
            Copy from Day {dayNumber - 1}
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Wake Time</label>
        <input type="time" value={form.wakeTime} onChange={e => setForm(prev => ({ ...prev, wakeTime: e.target.value }))}
          className="mt-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:outline-none" />
      </div>

      {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map(meal => (
        <div key={meal} className="rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 capitalize mb-3">{meal}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Time</label>
              <input type="time" value={form[meal].time}
                onChange={e => updateMeal(meal, 'time', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Food</label>
              <input type="text" value={form[meal].food} placeholder="What did you eat?"
                onChange={e => updateMeal(meal, 'food', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Food Categories Consumed Today</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FOOD_CATEGORIES.map(cat => {
            const key = cat as keyof typeof form;
            const checked = form[key] as boolean;
            return (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={checked}
                  onChange={() => setForm(prev => ({ ...prev, [cat]: !checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-amber-700" />
                <span className="text-sm">{CATEGORY_ICONS[cat]} {FOOD_CATEGORY_LABELS[cat]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Meal Size</label>
          <select value={form.mealSize} onChange={e => setForm(prev => ({ ...prev, mealSize: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Eating Speed</label>
          <select value={form.eatingSpeed} onChange={e => setForm(prev => ({ ...prev, eatingSpeed: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="slow">Slow</option>
            <option value="moderate">Moderate</option>
            <option value="fast">Fast</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hunger Before Meals</label>
          <select value={form.hungerBeforeMeals} onChange={e => setForm(prev => ({ ...prev, hungerBeforeMeals: e.target.value }))}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms After Meals</label>
        <input type="text" placeholder="e.g., bloating, gas, heaviness (comma separated)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
              e.preventDefault();
              const val = (e.target as HTMLInputElement).value;
              setForm(prev => ({
                ...prev,
                symptomsAfterMeals: [...new Set([...prev.symptomsAfterMeals, ...val.split(',').map(s => s.trim()).filter(Boolean)])],
              }));
              (e.target as HTMLInputElement).value = '';
            }
          }}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        <div className="mt-2 flex flex-wrap gap-2">
          {form.symptomsAfterMeals.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
              {s}
              <button onClick={() => setForm(prev => ({ ...prev, symptomsAfterMeals: prev.symptomsAfterMeals.filter((_, j) => j !== i) }))}>&times;</button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => router.push(dayNumber > 1 ? `/intake/food-diary/${dayNumber - 1}` : '/intake/vikriti/review')}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Previous</button>
        <button onClick={save} className="rounded-lg border border-amber-300 px-4 py-2 text-amber-700 hover:bg-amber-50">Save Day</button>
        <button onClick={async () => { await save(); router.push(dayNumber < 7 ? `/intake/food-diary/${dayNumber + 1}` : '/intake/food-diary/review'); }}
          className="flex-1 rounded-lg bg-amber-700 px-4 py-2 text-white hover:bg-amber-800">
          {dayNumber < 7 ? 'Save & Next Day' : 'Save & Review'}
        </button>
      </div>
    </div>
  );
}
