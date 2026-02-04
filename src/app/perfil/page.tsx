"use client";
import { useState, useEffect } from "react";
import Header from "@/components/header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  User,
  Mail,
  Upload,
  Save,
  Camera,
  UserCircle,
  Shield,
} from "lucide-react";

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <PerfilContent />
    </ProtectedRoute>
  );
}

function PerfilContent() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    primeiroNome: "",
    ultimoNome: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        primeiroNome: user.primeiroNome,
        ultimoNome: user.ultimoNome,
        email: user.email,
      });

      // Set image preview if user has an image
      if (user.imagemUsuario && user.imagemUsuario.length > 0) {
        setImagePreview(`data:image/jpeg;base64,${user.imagemUsuario}`);
      }
    }
  }, [user]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Tipo de arquivo inválido. Use apenas JPEG, PNG ou WEBP");
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Prepare form data for image upload
      let imagemBase64 = null;

      if (selectedFile) {
        const reader = new FileReader();
        imagemBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(selectedFile);
        });
      }

      // Update user profile
      const response = await fetch(`/api/usuarios/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          primeiroNome: formData.primeiroNome,
          ultimoNome: formData.ultimoNome,
          email: formData.email,
          imagemUsuario: imagemBase64,
          removeImage: imagePreview === null && !selectedFile,
        }),
      });

      if (response.ok) {
        toast.success("Perfil atualizado com sucesso!");
        await refreshUser();
        setSelectedFile(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <UserCircle className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Meu Perfil
            </h1>
            <p className="text-slate-600 mt-1 font-medium">
              Gerencie suas informações pessoais
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-xl mb-6">
          <CardHeader className="px-6">
            <CardTitle className="text-slate-800 flex items-center gap-3 font-black text-xl">
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Camera className="h-5 w-5 text-white" />
              </div>
              Foto de Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar Preview */}
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-blue-200 shadow-xl">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-4xl">
                      {getInitials(formData.primeiroNome, formData.ultimoNome)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {imagePreview && (
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1 w-full">
                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 border-0"
                  >
                    <Upload className="h-5 w-5" />
                    Escolher Foto
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-sm text-slate-600 text-center font-medium">
                    Formatos: JPEG, PNG, WEBP • Tamanho máx: 5MB
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-green-600 font-semibold text-center">
                      📁 {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info Card */}
        <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 shadow-xl mb-6">
          <CardHeader className="px-6">
            <CardTitle className="text-slate-800 flex items-center gap-3 font-black text-xl">
              <div className="h-9 w-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <User className="h-5 w-5 text-white" />
              </div>
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="primeiroNome"
                  className="text-slate-700 flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-wide"
                >
                  <User className="h-4 w-4 text-blue-600" />
                  Primeiro Nome
                </Label>
                <Input
                  id="primeiroNome"
                  value={formData.primeiroNome}
                  onChange={(e) =>
                    setFormData({ ...formData, primeiroNome: e.target.value })
                  }
                  className="bg-white border-2 border-slate-300 text-slate-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <Label
                  htmlFor="ultimoNome"
                  className="text-slate-700 flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-wide"
                >
                  <User className="h-4 w-4 text-purple-600" />
                  Último Nome
                </Label>
                <Input
                  id="ultimoNome"
                  value={formData.ultimoNome}
                  onChange={(e) =>
                    setFormData({ ...formData, ultimoNome: e.target.value })
                  }
                  className="bg-white border-2 border-slate-300 text-slate-800 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </div>
              <div className="md:col-span-2">
                <Label
                  htmlFor="email"
                  className="text-slate-700 flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-wide"
                >
                  <Mail className="h-4 w-4 text-green-600" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-white border-2 border-slate-300 text-slate-800 font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="bg-gradient-to-br from-white to-orange-50 border-2 border-orange-200 shadow-xl mb-6">
          <CardHeader className="px-6">
            <CardTitle className="text-slate-800 flex items-center gap-3 font-black text-xl">
              <div className="h-9 w-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="h-5 w-5 text-white" />
              </div>
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border-2 border-orange-200 shadow-sm">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Tipo de Conta
                </p>
                <p className="text-lg font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {user.role === "admin" ? "Administrador" : "Usuário"}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-orange-200 shadow-sm">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Impressões Realizadas
                </p>
                <p className="text-lg font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {user.impressoesRealizadas || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 text-lg font-black shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all border-0"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
