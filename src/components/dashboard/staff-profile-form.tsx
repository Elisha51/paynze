
'use client';

import { useState } from 'react';
import type { Staff } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { FileUploader } from '../ui/file-uploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


type StaffProfileFormProps = {
    staff: Staff;
    onSave: (updatedStaff: Staff) => Promise<void>;
    onCancel: () => void;
    isSelfEditing?: boolean;
};

export function StaffProfileForm({ staff, onSave, onCancel, isSelfEditing = false }: StaffProfileFormProps) {
    const [formData, setFormData] = useState(staff);
    const { toast } = useToast();
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value }));
    };

    const handleFileChange = (files: File[]) => {
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
            };
            reader.readAsDataURL(files[0]);
        }
    };

    const handleVerificationDocsChange = (files: File[]) => {
        // This is a simulation. In a real app, you'd upload these files and get URLs.
        const newDocs = files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
        setFormData(prev => ({ ...prev, verificationDocuments: [...(prev.verificationDocuments || []), ...newDocs] }));
    }
    
    const handleCropComplete = async () => {
        if (!imageToCrop || !crop || !crop.width || !crop.height) return;

        const image = new Image();
        image.src = imageToCrop;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            toast({ variant: 'destructive', title: "Could not process image." });
            return;
        }

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        const croppedImageUrl = canvas.toDataURL('image/jpeg');
        setFormData(prev => ({ ...prev, avatarUrl: croppedImageUrl }));
        setImageToCrop(null);
    };

    const handleSaveChanges = async () => {
        try {
            await onSave(formData);
            toast({
                title: "Profile Updated",
                description: "Your profile information has been saved.",
            });
            onCancel(); // Go back to view mode
        } catch(e) {
             toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "Could not save your profile. Please try again.",
            });
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your name, contact details, and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                            <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                             <Label>Profile Picture</Label>
                             <FileUploader 
                                files={[]}
                                onFilesChange={handleFileChange}
                                maxFiles={1}
                                accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }}
                             />
                             <p className="text-xs text-muted-foreground">Recommended size: 200x200px. Max 2MB.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} disabled={isSelfEditing} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
                    </div>
                    
                    {isSelfEditing && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Verification Documents</CardTitle>
                                <CardDescription>Upload documents to verify your identity (e.g., National ID, Driver's License).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileUploader
                                    files={formData.verificationDocuments || []}
                                    onFilesChange={handleVerificationDocsChange}
                                    maxFiles={5}
                                    accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'] }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                        <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && setImageToCrop(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crop Your Profile Picture</DialogTitle>
                    </DialogHeader>
                    {imageToCrop && (
                        <div className="flex justify-center">
                            <ReactCrop
                                crop={crop}
                                onChange={c => setCrop(c)}
                                aspect={1}
                                minWidth={50}
                                circularCrop
                            >
                                <img src={imageToCrop} alt="Crop preview" />
                            </ReactCrop>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImageToCrop(null)}>Cancel</Button>
                        <Button onClick={handleCropComplete}>Save Crop</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
