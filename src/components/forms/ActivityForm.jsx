import { useState, useRef } from 'react';
import { Upload, Trash2, MapPin, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ACTIVITY_TYPES, calculateCO2Saved, calculateImpactScore } from '../../utils/calculations';
import { validateActivity, validateRequiredFields, getFlagSeverity, getFlagDescription } from '../../utils/validation';
import { cn } from '@/lib/utils';

export default function ActivityForm({ onSubmit, existingActivities = [] }) {
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        activity_type: '',
        description: '',
        quantity: '',
        activity_date: new Date().toISOString().split('T')[0],
        location: '',
        photo: null,
        photoPreview: null,
    });

    const [errors, setErrors] = useState({});
    const [validationResult, setValidationResult] = useState(null);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handlePhotoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    photo: file,
                    photoPreview: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setFormData(prev => ({ ...prev, photo: null, photoPreview: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleValidate = () => {
        const result = validateActivity(
            { ...formData, hours: formData.quantity },
            existingActivities
        );
        setValidationResult(result);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const { isValid, errors: fieldErrors } = validateRequiredFields({
            ...formData,
            hours: formData.quantity,
        });

        if (!isValid) {
            setErrors(fieldErrors);
            return;
        }

        const validation = validateActivity(
            { ...formData, hours: formData.quantity },
            existingActivities
        );
        setValidationResult(validation);

        if (!validation.isValid) {
            return;
        }

        const activityData = {
            ...formData,
            quantity: parseFloat(formData.quantity),
            hours: ACTIVITY_TYPES[formData.activity_type]?.unit === 'hours' ? parseFloat(formData.quantity) : undefined,
            photo_url: formData.photoPreview,
            ai_validation_flags: validation.flags,
        };

        onSubmit(activityData);
    };

    const selectedType = ACTIVITY_TYPES[formData.activity_type];
    const co2Saved = formData.activity_type && formData.quantity
        ? calculateCO2Saved(formData.activity_type, parseFloat(formData.quantity) || 0)
        : 0;
    const impactScore = formData.activity_type && formData.quantity
        ? calculateImpactScore(formData.activity_type, parseFloat(formData.quantity) || 0)
        : 0;

    const handleDetectLocation = async () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        handleChange('location', 'Detecting...');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    const address = data.display_name?.split(',').slice(0, 3).join(', ')
                        || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    handleChange('location', address);
                } catch {
                    handleChange('location', `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
                }
            },
            (error) => {
                handleChange('location', '');
                alert('Unable to get location: ' + error.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Activity Type */}
                <div className="space-y-2">
                    <Label>Activity Type *</Label>
                    <Select value={formData.activity_type} onValueChange={(val) => handleChange('activity_type', val)}>
                        <SelectTrigger className={errors.activity_type ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(ACTIVITY_TYPES).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: value.color }} />
                                        {value.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.activity_type && <p className="text-xs text-red-500">{errors.activity_type}</p>}
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                    <Label>{selectedType ? `${selectedType.label} (${selectedType.unit})` : 'Quantity/Hours'} *</Label>
                    <Input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        placeholder="Enter amount"
                        min="0"
                        step="0.1"
                        className={errors.quantity ? 'border-red-500' : ''}
                    />
                    {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
                    {selectedType?.description && <p className="text-xs text-muted-foreground">{selectedType.description}</p>}
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <Label>Activity Date *</Label>
                    <Input
                        type="date"
                        value={formData.activity_date}
                        onChange={(e) => handleChange('activity_date', e.target.value)}
                        className={errors.activity_date ? 'border-red-500' : ''}
                    />
                    {errors.activity_date && <p className="text-xs text-red-500">{errors.activity_date}</p>}
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <Label>Location (Optional)</Label>
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                                placeholder="e.g., Company Campus"
                                className="pl-9"
                            />
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleDetectLocation}>
                            Detect
                        </Button>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe what you did and the impact..."
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
                <Label>Photo Proof (Optional but recommended)</Label>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                        formData.photoPreview ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-primary/5"
                    )}
                >
                    {formData.photoPreview ? (
                        <div className="relative inline-block">
                            <img
                                src={formData.photoPreview}
                                alt="Preview"
                                className="max-w-full max-h-48 rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePhoto();
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Click to upload a photo</p>
                            <p className="text-xs text-muted-foreground/70">JPG, PNG up to 5MB</p>
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handlePhotoUpload}
                    />
                </div>
            </div>

            {/* Impact Calculator */}
            {formData.activity_type && formData.quantity && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Calculator className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Calculated Impact</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                                <p className="text-xl font-bold text-primary">{co2Saved.toFixed(2)} kg</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Impact Score</p>
                                <p className="text-xl font-bold text-teal-600">{impactScore.toFixed(1)} pts</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-muted-foreground">Equivalent to</p>
                                <p className="font-medium">
                                    {co2Saved > 0
                                        ? `${(co2Saved / 0.21).toFixed(1)} km of driving emissions saved`
                                        : 'Social impact contribution'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Validation Result */}
            {validationResult && (
                <div className="space-y-2">
                    {validationResult.errors.length > 0 && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {validationResult.errors.map((err, i) => (
                                <div key={i}>{err}</div>
                            ))}
                        </div>
                    )}
                    {validationResult.warnings.length > 0 && (
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                            {validationResult.warnings.map((warn, i) => (
                                <div key={i}>{warn}</div>
                            ))}
                        </div>
                    )}
                    {validationResult.flags.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            {validationResult.flags.map((flag) => (
                                <Badge
                                    key={flag}
                                    variant={getFlagSeverity(flag) === 'error' ? 'destructive' : 'warning'}
                                    className="text-xs"
                                >
                                    {getFlagDescription(flag)}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleValidate}
                    disabled={!formData.activity_type || !formData.quantity}
                >
                    Validate
                </Button>
                <Button
                    type="submit"
                    variant="gradient"
                    disabled={!formData.activity_type || !formData.quantity || !formData.description}
                >
                    Submit Activity
                </Button>
            </div>
        </form>
    );
}
